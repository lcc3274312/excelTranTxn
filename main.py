import os
from tranFront import tranFront
from tranTrade import tranTrade

# 全域變數
localPath = os.path.dirname(os.path.abspath(__file__))
txnCode = input("請輸入要轉換交易代碼：")

outPutPath = localPath + f"/output/{txnCode}"
if not os.path.isdir(outPutPath):
    os.makedirs(outPutPath)

# 前端轉換
tranFront = tranFront(localPath, txnCode)
frontPath = outPutPath + '/Front'
if not os.path.isdir(frontPath):
    os.makedirs(frontPath)
with open(frontPath+ '/' +f"{txnCode}.component.html", 'w', encoding="utf-8") as f:
    f.write(tranFront.tranHTML())
    f.close()
with open(frontPath+ '/' +f"{txnCode}S2.component.html", 'w', encoding="utf-8") as f:
    f.write(tranFront.tranHTML('S2'))
    f.close()
with open(frontPath+ '/' +f"{txnCode}.component.ts", 'w', encoding="utf-8") as f:
    f.write(tranFront.tranTS())
    f.close()
with open(frontPath+ '/' +f"{txnCode}.model.ts", 'w', encoding="utf-8") as f:
    f.write(tranFront.tranModel())
    f.close()
with open(frontPath+ '/' +f"{txnCode}S2.component.ts", 'w', encoding="utf-8") as f:
    f.write(tranFront.tranTSS2())
    f.close()
with open(frontPath+ '/' +f"{txnCode}.component.css", 'w', encoding="utf-8") as f:
    f.write(tranFront.tranCSS())
    f.close()
with open(frontPath+ '/' +f"{txnCode}.module.ts", 'w', encoding="utf-8") as f:
    f.write(tranFront.tranModule())
    f.close()

# 後端轉換
tradePath = outPutPath + '/trade'
tranTrade = tranTrade(localPath, txnCode)
if not os.path.isdir(tradePath):
    os.makedirs(tradePath)
with open(tradePath+ '/' +f"AddEdit.cs", 'w', encoding="utf-8") as f:
    f.write(tranTrade.tranAddEditSc())
    f.close()
with open(tradePath+ '/' +f"Query.cs", 'w', encoding="utf-8") as f:
    f.write(tranTrade.tranQueryCs())
    f.close()
with open(tradePath+ '/' +f"Del.cs", 'w', encoding="utf-8") as f:
    f.write(tranTrade.tranDelCs())
    f.close()

abs_path = os.path.abspath(outPutPath)
print(f"轉換成功!，檔案存放路徑=> {abs_path} \n")
os.system("pause")