export interface <var_txnCode>GridModel {
<var_ResponseModel>
}

export interface DelRequest {
<var_pkColumn>
}

export interface QueryRequest {
<var_RequestModel>
}

export interface QueryResponse {
  dgRowCount: number
  dgRowData: Array<{
    rank: number
  } & <var_txnCode>GridModel>
}
