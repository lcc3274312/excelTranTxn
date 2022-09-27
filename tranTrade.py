from urllib import request
import pandas as pd

def titleLower(var_name):
    result = var_name[0].lower() + var_name[1:]
    return result

class tranTrade:
    def __init__(self, path, txnCode):
        txnDataAll = pd.read_excel(path+"/source/系統畫面設計.xlsx", sheet_name="後台交易代碼")

        self.path = path
        self.txnCode = txnCode
        self.txnData = txnDataAll.loc[txnDataAll['第3層代碼'] == txnCode].reset_index(drop=True)
        self.columnData = pd.read_excel(path+"/source/系統資料庫設計.xlsx", sheet_name=self.txnData["資料表名稱"][0])
        self.pkColumnData = self.columnData.loc[self.columnData['主鍵'] == 'PK'].reset_index(drop=True)
        self.queryCondition = self.txnData["查詢條件"][0].split('、')

    def tranQueryCs(self):
        file = open(self.path+ '/template/template_Query.cs', "r", encoding="utf-8")
        new_query = file.read()
        file.close()

        new_query = new_query.replace('<var_txnCode>', self.txnCode)
        new_query = new_query.replace('<var_txnName>', self.txnData['第3層名稱'][0])

        # 組 sql
        sqlContent = f'''SELECT
    ROW_NUMBER() OVER( ORDER BY {self.pkColumnData['欄位名稱'][0]} ) AS rank'''
        maxlength = len(max(map(str,list(self.columnData['欄位名稱'])), key=len))
        for index, row in self.columnData.iterrows():
            repeatSpace = ' '*(maxlength - len(str(row['欄位名稱'])))
            AsName = titleLower(str(row['欄位名稱']))
            sqlContent += f'''\n\t,{row['欄位名稱']}{repeatSpace}  AS  {AsName}{repeatSpace}--{row['描述']}'''
        sqlContent += f'''
FROM dbo.{self.txnData["資料表名稱"][0]} WITH(NOLOCK)
Where 1=1
'''

        new_query = new_query.replace('<var_querySql>', sqlContent)

        # 組 request model
        requestModel = ''
        for row in self.queryCondition :
            if row in ['CreateTime','ModifyTime','Creator', 'Modifier']:
                continue
            requestModel += f"\t\t\tpublic string {row} {'{'} get; set; {'}'}\n"

        new_query = new_query.replace('<var_queryClass>', requestModel)

        # 組 request content
        requestContent = ''
        for index, row in self.columnData.iterrows():
            if row['欄位名稱'] not in self.queryCondition:
                continue
            dataType = ''
            if (str(row['資料類型']).startswith('nvarchar')):
                dataType = 'NVarChar'
            elif (str(row['資料類型']).startswith('varchar')):
                dataType = 'VarChar'
            elif (str(row['資料類型']).startswith('char')):
                dataType = 'Char'
            elif (str(row['資料類型']).startswith('int')):
                dataType = 'Int'
            if str(row['備註']) == 'nan':
                requestContent += f'''
            if (!string.IsNullOrEmpty(request.{row['欄位名稱']}))
            {'{'}
                sql += @" AND {row['欄位名稱']} like '%' + @{row['欄位名稱']} + '%' ";
                cmd.Parameters.Add("{row['欄位名稱']}", SqlDbType.{dataType}).Value = request.{row['欄位名稱']};
            {'}'}
                '''
            else:
                requestContent += f'''
            if (!string.IsNullOrEmpty(request.{row['欄位名稱']}) && !request.{row['欄位名稱']}.StartsWith("*", StringComparison.InvariantCulture))
            {'{'}
                sql += @" AND {row['欄位名稱']} = @{row['欄位名稱']} ";
                cmd.Parameters.Add("{row['欄位名稱']}", SqlDbType.{dataType}).Value = request.{row['欄位名稱']};
            {'}'}
                '''
        new_query = new_query.replace('<var_queryContent>', requestContent)
        return new_query

    def tranAddEditSc(self):
        file = open(self.path+ '/template/template_AddEdit.cs', "r", encoding="utf-8")
        new_AddEditSc = file.read()
        file.close()

        new_AddEditSc = new_AddEditSc.replace('<var_txnCode>', self.txnCode)
        new_AddEditSc = new_AddEditSc.replace('<var_txnName>', self.txnData['第3層名稱'][0])

        # 組 sql
        sqlContent = f'''MERGE INTO dbo.{self.txnData["資料表名稱"][0]} as T
USING (
    SELECT @{self.pkColumnData['欄位名稱'][0]} {self.pkColumnData['欄位名稱'][0]}
) S
ON T.{self.pkColumnData['欄位名稱'][0]} = S.{self.pkColumnData['欄位名稱'][0]}
WHEN MATCHED THEN
    UPDATE SET'''
        var_splic = ''
        maxlength = len(max(map(str,list(self.columnData['欄位名稱'])), key=len))
        for index, row in self.columnData.iterrows():
            repeatSpace = ' '*(maxlength - len(str(row['欄位名稱'])))
            if row['欄位名稱'] in ['CreateTime','ModifyTime']:
                sqlContent += f'''\n\t{var_splic}{row['欄位名稱']}{repeatSpace} = GETDATE()  {repeatSpace}--{row['描述']}'''
                var_splic = ','
                continue
            sqlContent += f'''\n\t{var_splic}{row['欄位名稱']}{repeatSpace} = @{row['欄位名稱']}{repeatSpace}--{row['描述']}'''
            var_splic = ','

        sqlContent += f'''
WHEN NOT MATCHED THEN
INSERT ('''
        var_splic = ''
        for index, row in self.columnData.iterrows():
            sqlContent += f'''\n\t{var_splic}{row['欄位名稱']}'''
            var_splic = ','
        sqlContent += '\n) VALUES ('
        var_splic = ''
        for index, row in self.columnData.iterrows():
            if row['欄位名稱'] in ['CreateTime','ModifyTime']:
                sqlContent += f'''\n\t{var_splic}GETDATE()'''
                var_splic = ','
                continue
            sqlContent += f'''\n\t{var_splic}@{row['欄位名稱']}'''
            var_splic = ','
        sqlContent += '\n);'

        new_AddEditSc = new_AddEditSc.replace('<var_AddEditSql>', sqlContent)

        # 組 request model
        requestModel = ''
        for index, row in self.columnData.iterrows():
            if row['欄位名稱'] in ['CreateTime','ModifyTime','Creator', 'Modifier']:
                continue
            requestModel += f"\t\t\tpublic string {row['欄位名稱']} {'{'} get; set; {'}'}\n"

        new_AddEditSc = new_AddEditSc.replace('<var_AddEditRequest>', requestModel)

        # 組 cmd.parameter
        parameterContent = ''
        for index, row in self.columnData.iterrows():
            if row['欄位名稱'] in ['CreateTime','ModifyTime','Creator', 'Modifier']:
                continue
            if (str(row['資料類型']).startswith('varchar')):
                if (str(row['允許Null']) == 'Y') :
                    parameterContent += f'''
            if (!string.IsNullOrEmpty(request.{row['欄位名稱']}))
            {'{'}
                cmd.Parameters.Add("{row['欄位名稱']}", SqlDbType.VarChar).Value = request.{row['欄位名稱']};
            {'}'}
            else
            {'{'}
                cmd.Parameters.Add("{row['欄位名稱']}", SqlDbType.VarChar).Value = DBNull.Value;
            {'}'}
            '''
                else:
                    parameterContent += f'''
            cmd.Parameters.Add("{row['欄位名稱']}", SqlDbType.VarChar).Value = request.{row['欄位名稱']};
                '''
            elif (str(row['資料類型']).startswith('char')):
                if (str(row['允許Null']) == 'Y') :
                    parameterContent += f'''
            if (!string.IsNullOrEmpty(request.{row['欄位名稱']}))
            {'{'}
                cmd.Parameters.Add("{row['欄位名稱']}", SqlDbType.Char).Value = request.{row['欄位名稱']};
            {'}'}
            else
            {'{'}
                cmd.Parameters.Add("{row['欄位名稱']}", SqlDbType.Char).Value = DBNull.Value;
            {'}'}
            '''
                else:
                    parameterContent += f'''
            cmd.Parameters.Add("{row['欄位名稱']}", SqlDbType.Char).Value = request.{row['欄位名稱']};
                '''
            elif (str(row['資料類型']).startswith('nvarchar')):
                if (str(row['允許Null']) == 'Y') :
                    parameterContent += f'''
            if (!string.IsNullOrEmpty(request.{row['欄位名稱']}))
            {'{'}
                cmd.Parameters.Add("{row['欄位名稱']}", SqlDbType.NVarChar).Value = request.{row['欄位名稱']};
            {'}'}
            else
            {'{'}
                cmd.Parameters.Add("{row['欄位名稱']}", SqlDbType.NVarChar).Value = DBNull.Value;
            {'}'}
            '''
                else:
                    parameterContent += f'''
            cmd.Parameters.Add("{row['欄位名稱']}", SqlDbType.NVarChar).Value = request.{row['欄位名稱']};
                '''
            elif (str(row['資料類型']).startswith('smallint')):
                parameterContent += f'''
            if (short.TryParse(request.{row['欄位名稱']}, out short {titleLower(row['欄位名稱'])}))
            {'{'}
                cmd.Parameters.Add("{row['欄位名稱']}", SqlDbType.SmallInt).Value = {titleLower(row['欄位名稱'])};
            {'}'}
            else
            {'{'}
                cmd.Parameters.Add("{row['欄位名稱']}", SqlDbType.SmallInt).Value = DBNull.Value;
            {'}'}
            '''
            elif (str(row['資料類型']).startswith('int')):
                parameterContent += f'''
            if (int.TryParse(request.{row['欄位名稱']}, out int {titleLower(row['欄位名稱'])}))
            {'{'}
                cmd.Parameters.Add("{row['欄位名稱']}", SqlDbType.Int).Value = {titleLower(row['欄位名稱'])};
            {'}'}
            else
            {'{'}
                cmd.Parameters.Add("{row['欄位名稱']}", SqlDbType.Int).Value = DBNull.Value;
            {'}'}
            '''
            elif(str(row['資料類型']).startswith('decimal')):
                parameterContent += f'''
            if (decimal.TryParse(request.{row['欄位名稱']}, out decimal {titleLower(row['欄位名稱'])}))
            {'{'}
                cmd.Parameters.Add("{row['欄位名稱']}", SqlDbType.Decimal).Value = {titleLower(row['欄位名稱'])};
            {'}'}
            else
            {'{'}
                cmd.Parameters.Add("{row['欄位名稱']}", SqlDbType.Decimal).Value = DBNull.Value;
            {'}'}
            '''
            elif (str(row['資料類型']).startswith('datetime')):
                parameterContent += f"cmd.Parameters.Add(\"{row['欄位名稱']}\", SqlDbType.DateTime).Value = Convert.ToDateTime(request.{ row['欄位名稱'] });"
            else:
                parameterContent += f"// error (row['欄位名稱'] => {row['欄位名稱']}, DataType => {str(row['資料類型'])}///////////////////////////////////////"

        new_AddEditSc = new_AddEditSc.replace('<var_AddEditParameters>', parameterContent)
        return new_AddEditSc

    def tranDelCs(self):
        file = open(self.path+ '/template/template_Del.cs', "r", encoding="utf-8")
        new_del = file.read()
        file.close()

        dataType = ''
        if (str(self.pkColumnData['資料類型'][0]).startswith('nvarchar')):
            dataType = 'NVarChar'
        elif (str(self.pkColumnData['資料類型'][0])):
            dataType = 'VarChar'
        elif (str(self.pkColumnData['資料類型'][0])):
            dataType = 'Char'

        new_del = new_del.replace('<var_txnCode>', self.txnCode)
        new_del = new_del.replace('<var_txnName>', self.txnData['第3層名稱'][0])
        new_del = new_del.replace('<var_pkColumn>', self.pkColumnData['欄位名稱'][0])
        new_del = new_del.replace('<var_pkColumnType>', dataType)
        new_del = new_del.replace('<var_dataName>', self.txnData["資料表名稱"][0])

        return new_del