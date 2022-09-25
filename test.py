import pandas as pd
import os

localPath = os.path.dirname(os.path.abspath(__file__))
tableDataAll = pd.read_excel(localPath+"/source/系統畫面設計.xlsx", sheet_name="後台交易代碼")
tableData = tableDataAll.loc[tableDataAll['查詢結果'] == "資料表全部欄位"]
tableData = tableData.reset_index(drop=True)
print(tableData)
print(tableDataAll)