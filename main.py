import os
import pandas as pd
from tran import tran

# 全域變數
localPath = os.path.dirname(os.path.abspath(__file__))
txnCode = input("請輸入要轉換交易代碼：")

tran = tran(localPath, txnCode)

outPutPath = localPath + f"/output/{txnCode}"
if not os.path.isdir(outPutPath):
    os.makedirs(outPutPath)

with open(outPutPath+ '/' +f"{txnCode}.component.html", 'w') as f:
    f.write(tran.tranHTML())
    f.close()
with open(outPutPath+ '/' +f"{txnCode}S2.component.html", 'w') as f:
    f.write(tran.tranHTML('S2'))
    f.close()
with open(outPutPath+ '/' +f"{txnCode}.component.ts", 'w') as f:
    f.write(tran.tranTS())
    f.close()
with open(outPutPath+ '/' +f"{txnCode}.component.css", 'w') as f:
    f.write(tran.tranCSS())
    f.close()
with open(outPutPath+ '/' +f"{txnCode}.module.ts", 'w') as f:
    f.write(tran.tranModule())
    f.close()