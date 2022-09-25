/**
 * 要保書文件欄位顯示規則設定
 */
export interface MI02007Model {
  hideRuleCategory: string  // 隱藏規則分類
  hideId: string            // 隱藏規則ID
  hideMethod: string        // 隱藏方法
  hideFields: string        // 隱藏欄位
  argFields: string         // 參考欄位
  args: string              // 參數
  remark: string            // 備註
  begDate: string           // 起始日期
  endDate: string           // 訖止日期
  hideType: string          // 隱藏規則啟用
}

export interface MI02007GridRow extends MI02007Model {
  delFlag: boolean           // 刪除欄位
}

export interface QueryRequest {
  DGPage: number
  hideRuleCategory: string
  hideId: string
  hideMethod: string
  hideFields: string
  begDate: string
  endDate: string
  hideType: string
}
export interface QueryResponse {
  dgRowCount: number
  docList: Array<{
    rank: number
  } & MI02007Model>
}

export interface DelRequest {
  docList: Array<{
    hideId: string
    begDate: string
  }>
}

export interface EditRequest extends MI02007Model {
  oldBegDate: string
}

export interface AddRequest extends MI02007Model {
}
