import pandas as pd

def titleLower(var_name):
    result = var_name[0].lower() + var_name[1:]
    return result

class tranFront:
    def __init__(self, path, txnCode):
        txnDataAll = pd.read_excel(path+"/source/系統畫面設計.xlsx", sheet_name="後台交易代碼")

        self.path = path
        self.txnCode = txnCode
        self.txnData = txnDataAll.loc[txnDataAll['第3層代碼'] == txnCode].reset_index(drop=True)
        self.columnData = pd.read_excel(path+"/source/系統資料庫設計.xlsx", sheet_name=self.txnData["資料表名稱"][0])
        self.pkColumnData = self.columnData.loc[self.columnData['主鍵'] == 'PK'].reset_index(drop=True)
        self.queryCondition = self.txnData["查詢條件"][0].split('、')

    def tranCSS(self):
        file = open(self.path+ '/template/template.component.css', "r", encoding="utf-8")
        new_css = file.read()
        file.close()

        new_css = new_css.replace('<var_txnCode>', self.txnCode)
        return new_css

    def tranModule(self):
        file = open(self.path+ '/template/template.module.ts', "r", encoding="utf-8")
        new_module = file.read()
        file.close()

        new_module = new_module.replace('<var_txnCode>', self.txnCode)
        new_module = new_module.replace('<var_txnName>', self.txnData['第3層名稱'][0])
        return new_module

    def tranHTML(self, type = 'main'):
        new_html = ''
        if type == 'main':
            file = open(self.path+ '/template/template.component.html', "r", encoding="utf-8")
            new_html = file.read()
            file.close()
        else:
            file = open(self.path+ '/template/templateS2.component.html', "r", encoding="utf-8")
            new_html = file.read()
            file.close()

        queryContent = ''
        for index, row in self.columnData.iterrows():
            requireNote = '' if str(row['允許Null']) == 'Y' else '*'
            disableNote = '\n            [disabled]=\'viewMode\'' if str(row['欄位名稱']) != self.pkColumnData['欄位名稱'][0] else '\n            [disabled]=\'viewMode || editMode\''
            if (type == 'main'):
                requireNote = ''
                disableNote = ''
                if (row['欄位名稱'] not in self.queryCondition):
                    continue
            if str(row['備註']) == "nan":
                queryContent += f"""
      <div class='row-fluid'>
        <div class='span12'>
          <span class='eControl eTitle'>{requireNote}{row['描述'].replace('險種', '商品')}</span>
          <es-textbox
            [(esModel)]='tioa.{titleLower(row['欄位名稱'])}'{disableNote}>
          </es-textbox>
        </div>
      </div>
"""
            else:
                hasSpaceContent = ''
                if (type == 'main' and row["允許Null"] == "Y"):
                    hasSpaceContent = "\n      [hasSpace]='true'"
                elif (type == 'S2' and row["允許Null"] == "Y"):
                    hasSpaceContent = "\n            [hasSpace]='true'"
                queryContent += f"""
      <div class='row-fluid'>
        <div class='span12'>
          <span class='eControl eTitle'>{requireNote}{row['描述'].replace('險種', '商品')}</span>
          <es-select
            [(esModel)]='tioa.{titleLower(row['欄位名稱'])}'
            [options]='cbData.{titleLower(row['欄位名稱'])}'{hasSpaceContent}{disableNote}>
          </es-select>
       </div>
      </div>
"""
                pass
        new_html = new_html.replace('<var_QueryContent>', queryContent)
        new_html = new_html.replace('<var_txnCode>', self.txnCode)
        return new_html

    def tranTS(self):
        file = open(self.path+ '/template/template.component.ts', "r", encoding="utf-8")
        new_ts = file.read()
        file.close()

        # 設定 tioa
        var_tioaDeclare = ''
        vat_tioaImplement = ''
        for queryItem in self.queryCondition:
            var_tioaDeclare += f"    {titleLower(queryItem)}: string\n"
            vat_tioaImplement += f"      {titleLower(queryItem)}: '',\n"
            pass

        # 設定 cbData
        var_cbDataDeclare = ''
        vat_cbDataImplement = ''
        var_comboBoxContent = ''
        for index, row in self.columnData.iterrows():
            if str(row['備註']) == "nan":
                continue
            if row['欄位名稱'] in self.queryCondition:
                var_comboBoxContent += f"      {titleLower(row['欄位名稱'])}: ['{str(row['備註'])[-3:]}', '*', 'Asc'],\n"
                var_cbDataDeclare += f"    {titleLower(row['欄位名稱'])}: ComboData[]\n"
                vat_cbDataImplement += f"      {titleLower(row['欄位名稱'])}: [],\n"

        # 設定 gridOption
        var_gridContent = ''
        for index, row in self.columnData.iterrows():
            if self.txnData['查詢結果'][0] == '同查詢條件欄位' and row['欄位名稱'] in self.queryCondition:
                var_gridContent += f", {'{'}\n        headerName: '{row['描述'].replace('險種', '商品')}',\n        field: '{titleLower(row['欄位名稱'])}',\n        width: 135\n      {'}'}"
                continue
            elif self.txnData['查詢結果'][0] == '資料表全部欄位':
                var_gridContent += f", {'{'}\n        headerName: '{row['描述'].replace('險種', '商品')}',\n        field: '{titleLower(row['欄位名稱'])}',\n        width: 135\n      {'}'}"

        new_ts = new_ts.replace('<var_tioaDeclare>', var_tioaDeclare)
        new_ts = new_ts.replace('<var_cbDataDeclare>', var_cbDataDeclare)
        new_ts = new_ts.replace('<vat_tioaImplement>', vat_tioaImplement)
        new_ts = new_ts.replace('<vat_cbDataImplement>', vat_cbDataImplement)
        new_ts = new_ts.replace('<var_gridContent>', var_gridContent)
        new_ts = new_ts.replace('<var_comboBoxContent>', var_comboBoxContent)
        new_ts = new_ts.replace('<var_txnCode>', self.txnCode)
        new_ts = new_ts.replace('<var_pkColumn>', titleLower(self.pkColumnData['欄位名稱'][0]))
        new_ts = new_ts.replace('<var_txnName>', self.txnData['第3層名稱'][0])
        return new_ts

    def tranTSS2(self):
        file = open(self.path+ '/template/templateS2.component.ts', "r", encoding="utf-8")
        new_ts = file.read()
        file.close()

        # 設定 tioa
        var_tioaDeclare = ''
        vat_tioaImplement = ''
        maxlength = len(max(map(str,list(self.columnData['欄位名稱'])), key=len))
        for index, row in self.columnData.iterrows():
            repeatSpace = ' '*(maxlength - len(str(row['欄位名稱'])))
            var_tioaDeclare += f"\t\t{titleLower(row['欄位名稱'])}: string{repeatSpace} // {row['描述']}\n"
            vat_tioaImplement += f"\t\t\t{titleLower(row['欄位名稱'])}: '',{repeatSpace} // {row['描述']}\n"
            pass

        # 設定 cbData
        var_cbDataDeclare = ''
        vat_cbDataImplement = ''
        var_comboBoxContent = ''
        for index, row in self.columnData.iterrows():
            if str(row['備註']) == "nan":
                continue
            var_cbDataDeclare += f"    {titleLower(row['欄位名稱'])}: ComboData[]\n"
            vat_cbDataImplement += f"      {titleLower(row['欄位名稱'])}: [],\n"
            var_comboBoxContent += f"      {titleLower(row['欄位名稱'])}: ['{str(row['備註'])[-3:]}', false, 'Asc'],\n"

        new_ts = new_ts.replace('<var_tioaDeclare>', var_tioaDeclare)
        new_ts = new_ts.replace('<var_cbDataDeclare>', var_cbDataDeclare)
        new_ts = new_ts.replace('<vat_tioaImplement>', vat_tioaImplement)
        new_ts = new_ts.replace('<vat_cbDataImplement>', vat_cbDataImplement)
        new_ts = new_ts.replace('<var_comboBoxContent>', var_comboBoxContent)
        new_ts = new_ts.replace('<var_txnCode>', self.txnCode)
        new_ts = new_ts.replace('<var_txnName>', self.txnData['第3層名稱'][0])
        return new_ts

    def tranModel(self):
        file = open(self.path+ '/template/template.model.ts', "r", encoding="utf-8")
        new_ts = file.read()
        file.close()
        maxlength = len(max(map(str,list(self.columnData['欄位名稱'])), key=len))
        # 設定 Model
        var_ResponseModel = ''
        var_RequestModel = ''
        var_pkColumn = f"{titleLower(str(self.pkColumnData['欄位名稱'][0]))}: string"
        for index, row in self.columnData.iterrows():
            repeatSpace = ' '*(maxlength - len(str(row['欄位名稱'])))
            if row['欄位名稱'] in self.queryCondition:
                var_RequestModel += f"  {titleLower(row['欄位名稱'])}: string{repeatSpace}  //{row['描述']}\n"
            var_ResponseModel += f"  {titleLower(row['欄位名稱'])}: string{repeatSpace}  //{row['描述']}\n"

        new_ts = new_ts.replace('<var_ResponseModel>', var_ResponseModel)
        new_ts = new_ts.replace('<var_RequestModel>', var_RequestModel)
        new_ts = new_ts.replace('<var_txnCode>', self.txnCode)
        new_ts = new_ts.replace('<var_pkColumn>', var_pkColumn)
        return new_ts