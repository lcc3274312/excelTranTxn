import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { GridOptions } from 'ag-grid'
import { ComboData, TransactionInitParams, ComponentParams } from '@systex-f25b/esoaf-front/core/model'
import { getLogger } from '@systex-f25b/esoaf-front/utils'
import { SocketService, ComboboxService, asComboBoxRequests } from '@systex-f25b/esoaf-front/core/service'
import { TabsService, StatusbarService } from '@systex-f25b/esoaf-front/platform'
import { pageCheck, hasLastPage, hasNextPage, lastPageQuery, nextPageQuery } from '@systex-f25b/esoaf-front/lib'
import {
  OverlayService,
  MessageboxService,
  ValidateService,
  GridTextRendererComponent,
  GridButtonRendererComponent,
  GridSelectRendererComponent,
  GridDefaultOption
} from '@systex-f25b/esoaf-front/core/component'
import { <var_txnCode>S2Component, dialogShareData } from './<var_txnCode>S2.component'
import { DelRequest, QueryRequest, QueryResponse, <var_txnCode>GridModel } from './<var_txnCode>.model'
import _ from 'lodash'

const logger = getLogger(__filename)

@Component({
  selector: 'txn-<var_txnCode>',
  templateUrl: './<var_txnCode>.component.html'
})

/**
 * @description  <var_txnName> (<var_txnCode>)
 */
export class <var_txnCode>Component implements OnInit {
  @ViewChild('<var_txnCode>') el: ElementRef<HTMLDivElement>
  menuID: string
  tioa: {
<var_tioaDeclare>
    DGPage: number
  }

  cbData: {
<var_cbDataDeclare>
  }

  <var_txnCode>GridOptions: GridOptions
  <var_txnCode>RowData: <var_txnCode>GridModel[]
  hasLastPage: boolean
  hasNextPage: boolean
  viewMode: boolean
  constructor (
    private readonly tabsService: TabsService,
    private readonly statusbarService: StatusbarService,
    private readonly overlayService: OverlayService,
    private readonly socketService: SocketService,
    private readonly messageboxService: MessageboxService,
    private readonly comboboxService: ComboboxService,
    private readonly validateService: ValidateService,
  ) {
    this.menuID = '<var_txnCode>'
    this.tioa = {
<vat_tioaImplement>
      DGPage: 0
    }

    this.cbData = {
<vat_cbDataImplement>
    }

    this.hasLastPage = false
    this.hasNextPage = false

    this.<var_txnCode>GridOptions = {
      ...GridDefaultOption,
      columnDefs: [{
        headerName: '查看',
        field: '',
        hide: !this.hasAuth('AddEditDel'),
        cellRenderer: 'gridButtonRenderer',
        cellRendererParams: {
          text: '查看',
          click: async (selectedRow: <var_txnCode>GridModel) => await this.addEditViewRow('View', selectedRow)
        },
        width: 75
      }, {
        headerName: '修改',
        field: '',
        hide: !this.hasAuth('AddEditDel'),
        cellRenderer: 'gridButtonRenderer',
        cellRendererParams: {
          text: '修改',
          click: async (selectedRow: <var_txnCode>GridModel) => await this.addEditViewRow('Edit', selectedRow)
        },
        width: 75
      }, {
        headerName: '刪除',
        field: '',
        hide: !this.hasAuth('AddEditDel'),
        cellRenderer: 'gridButtonRenderer',
        cellRendererParams: {
          text: '刪除',
          click: async (selectedRow: <var_txnCode>GridModel) => await this.delClick(selectedRow)
        },
        width: 75
      }<var_gridContent>
      ],
      frameworkComponents: {
        gridSelectRender: GridSelectRendererComponent,
        gridTextRender: GridTextRendererComponent,
        gridButtonRenderer: GridButtonRendererComponent,
      }
    }
  }

  /**
   * 交易載入
   */
  async ngOnInit (): Promise<void> {
    logger.info('Init <var_txnCode> component')
    await this.requestComboBox()
  }
  /**
   * 定義 ComboBox Data 欄位
   */
  async requestComboBox (): Promise<void> {
    const oCB = asComboBoxRequests({
<var_comboBoxContent>
    })

    this.cbData = _.assign({ }, this.cbData, await this.comboboxService.requestComboBox(oCB))
  }

  /**
   * 查詢
   *
   * @param dgPage - 查詢頁數
   */
   async queryTxn (dgPage: number): Promise<void> {
    try {
      const oTia: QueryRequest = {
        DGPage: dgPage,
        ..._.omit(this.tioa, 'DGPage')
      }
      const response = await this.socketService
        .sendRecv<QueryRequest, QueryResponse>('<var_txnCode>', 'Query', 'Query', oTia)
      const dgRowData = response.body?.dgRowData
      this.PRD00001RowData = _.map(dgRowData, row => ({
        ...(_.omit(row, ['rank']))
      }))
      if (_.isEmpty(dgRowData)) {
        return
      }
      const page = pageCheck(response, dgRowData)
      this.hasLastPage = hasLastPage(page.databeg)
      this.hasNextPage = hasNextPage(page.dataend, page.DGrowcount)
      this.tioa.DGPage = dgPage
      this.statusbarService.showMessageWithErrorCode('A0008', `${page.DGrowcount}`, `${page.databeg}`, `${page.dataend}`)
    } catch (e) {
      logger.error('queryTxn Error', e)
      void this.messageboxService.showErrorMessagebox(e)
    }
  }

  /**
   * 修改 按鈕
   *
   * @param txnType 功能類別
   * @param selectedRow 選取列
   */
  async addEditViewRow (txnType: 'Add' | 'Edit' | 'View', selectedRow?: <var_txnCode>GridModel): Promise<void> {
    const dialogReturn = await this.overlayService.showOverlay<<var_txnCode>S2Component, dialogShareData, boolean>({
      component: <var_txnCode>S2Component,
      height: '545px',
      width: '680px',
      data: {
        action: txnType,
        rowData: selectedRow,
        menuID: this.menuID
      }
    })

    if (dialogReturn !== true) {
      return
    }

    await this.queryTxn(this.tioa.DGPage)
  }

  /**
   * 刪除
   *
   * @parm selectRow 選取列
   */
  async delClick (selectedRow: <var_txnCode>GridModel): Promise<void> {
    try {
      this.statusbarService.clearMessage()
      const tioa: DelRequest = {
        <var_pkColumn>: selectedRow.<var_pkColumn>
      }
      await this.socketService.sendRecv<DelRequest, null>(this.menuID, 'AddEditDel', 'Del', selectedRow)
      await this.queryTxn(this.tioa.DGPage)
    } catch (e) {
      logger.error('delDocList Error', e)
      void this.messageboxService.showErrorMessagebox(e)
    }
  }

  /**
   * 上下頁切換
   *
   * @parm type 切換類型
   */
  async pageQuery (type: string): Promise<void> {
    const nNowPage = type === 'last' ? lastPageQuery(this.tioa) : nextPageQuery(this.tioa)
    this.tioa.DGPage = nNowPage
    await this.queryTxn(nNowPage)
  }

  /**
   * 清除資料
   */
  clear (): void {
    this.tioa = {
<vat_tioaImplement>
      DGPage: 0
    }
    this.hasLastPage = false
    this.hasNextPage = false
    this.<var_txnCode>RowData = []
    this.statusbarService.clearMessage()
  }

  /**
   * 權限
   *
   * @param status AddEditDel|Export|Print|Query
   * @returns 是否有此權限
   */
  hasAuth (status: 'AddEditDel' | 'Export' | 'Print' | 'Query'): boolean {
    return this.tabsService.hasAuth(this.menuID, status)
  }

  /**
   * 關閉 按鈕
   */
  exitTxn (): void {
    this.tabsService.searchRemoveTab(this.menuID)
    logger.info('Exit <var_txnCode> component')
  }
}
