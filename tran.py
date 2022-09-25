import codecs
import pandas as pd

def titleLower(var_name):
    result = var_name[0].lower() + var_name[1:]
    return result

class tran:
    def __init__(self, path, txnCode):
        txnDataAll = pd.read_excel(path+"/source/系統畫面設計.xlsx", sheet_name="後台交易代碼")

        self.path = path
        self.txnCode = txnCode
        self.txnData = txnDataAll.loc[txnDataAll['第3層代碼'] == txnCode].reset_index(drop=True)
        self.columnData = pd.read_excel(path+"/source/系統資料庫設計.xlsx", sheet_name=self.txnData["資料表名稱"][0])

    def tranCSS(self):
        file = codecs.open(self.path+ '/module/template.component.css', "r", "utf-8")
        new_css = file.read()
        file.close()

        new_css = new_css.replace('<var_txnCode>', self.txnCode)
        return new_css
    
    def tranModule(self):
        file = codecs.open(self.path+ '/module/template.module.ts', "r", "utf-8")
        new_module = file.read()
        file.close()

        new_module = new_module.replace('<var_txnCode>', self.txnCode)
        new_module = new_module.replace('<var_txnName>', self.txnData['第3層名稱'][0])
        return new_module

    def tranHTML(self, type = 'main'):
        new_html = ''
        if type == 'main':
            file = codecs.open(self.path+ '/module/template.component.html', "r", "utf-8")
            new_html = file.read()
            file.close()
        else:
            file = codecs.open(self.path+ '/module/templateS2.component.html', "r", "utf-8")
            new_html = file.read()
            file.close()

        queryContent = ''
        for index, row in self.columnData.iterrows():
            if (type == 'main'):
                queryContentList = self.txnData["查詢條件"][0].split('、')
                if (row['欄位名稱'] not in queryContentList):
                    continue
            if str(row['備註']) == "nan":
                queryContent += f"""
      <div class='row-fluid'>
        <div class='span12'>
          <span class='eControl eTitle'>{row['描述'].replace('險種', '商品')}</span>
          <es-textbox
           [(esModel)]='tioa.{titleLower(row['欄位名稱'])}'>
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
          <span class='eControl eTitle'>{row['描述'].replace('險種', '商品')}</span>
          <es-select
            [(esModel)]='tioa.{titleLower(row['欄位名稱'])}'
            [options]='cbData.{titleLower(row['欄位名稱'])}'{hasSpaceContent}>
          </es-select>
       </div>
      </div>
"""
                pass
        new_html = new_html.replace('<var_QueryContent>', queryContent)
        new_html = new_html.replace('<var_txnCode>', self.txnCode)
        return new_html

    def tranTS(self):
        file = codecs.open(self.path+ '/module/template.component.ts', "r", "utf-8")
        new_ts = file.read()
        file.close()
        queryContentList = self.txnData["查詢條件"][0].split('、')
        
        # 設定 tioa
        var_tioaDeclare = ''
        vat_tioaImplement = ''
        for queryItem in queryContentList:
            var_tioaDeclare += f"\t\t{titleLower(queryItem)}: string\t\t\t//\n"
            vat_tioaImplement += f"\t\t\t{titleLower(queryItem)}: '',\t\t\t//\n"
            pass

        # 設定 cbData
        var_cbDataDeclare = ''
        vat_cbDataImplement = ''
        var_comboBoxContent = ''
        for index, row in self.columnData.iterrows():
            if str(row['備註']) == "nan":
                continue
            var_cbDataDeclare += f"\t\t{titleLower(row['欄位名稱'])}: ComboData[]\n"
            vat_cbDataImplement += f"\t\t\t{titleLower(row['欄位名稱'])}: []\n"
            if row['欄位名稱'] in queryContentList:
                var_comboBoxContent += f"\t\t\t{titleLower(row['欄位名稱'])}: ['{str(row['備註'])[-3]}', '*', 'Asc']\n"
            else:
                var_comboBoxContent += f"\t\t\t{titleLower(row['欄位名稱'])}: ['{str(row['備註'])[-3:]}', false, 'Asc']\n"

        # 設定 gridOption
        var_gridContent = ''
        for index, row in self.columnData.iterrows():
            if self.txnData['查詢結果'][0] == '同查詢條件欄位' and row['欄位名稱'] not in queryContentList:
                continue
            var_gridContent += f", {'{'}\n        headerName: '{row['描述'].replace('險種', '商品')}',\n        field: '{titleLower(row['欄位名稱'])}',\n        width: 135\n      {'}'}"

        new_ts = new_ts.replace('<var_tioaDeclare>', var_tioaDeclare)
        new_ts = new_ts.replace('<var_cbDataDeclare>', var_cbDataDeclare)
        new_ts = new_ts.replace('<vat_tioaImplement>', vat_tioaImplement)
        new_ts = new_ts.replace('<vat_cbDataImplement>', vat_cbDataImplement)
        new_ts = new_ts.replace('<var_gridContent>', var_gridContent)
        new_ts = new_ts.replace('<var_comboBoxContent>', var_comboBoxContent)
        new_ts = new_ts.replace('<var_txnCode>', self.txnCode)
        new_ts = new_ts.replace('<var_txnName>', self.txnData['第3層名稱'][0])
        return new_ts