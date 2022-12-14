import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { GridOptions } from 'ag-grid'
import { ComboData, TransactionInitParams, ComponentParams } from '@systex-f25b/esoaf-front/core/model'
import { getLogger } from '@systex-f25b/esoaf-front/utils'
import { SocketService, ComboboxService, asComboBoxRequests } from '@systex-f25b/esoaf-front/core/service'
import { TabsService, StatusbarService } from '@systex-f25b/esoaf-front/platform'
import { pageCheck, hasLastPage, hasNextPage, lastPageQuery, nextPageQuery } from '@systex-f25b/esoaf-front/lib'
import {
  MessageboxService, OverlayService, ValidateService,
  GridDefaultOption,
  GridButtonRendererComponent,
  GridSelectRendererComponent,
  GridTextRendererComponent
} from '@systex-f25b/esoaf-front/core/component'
import { <var_txnCode>S2Component, dialogShareData } from './<var_txnCode>S2.component'
import { DelRequest, QueryRequest, QueryResponse, <var_txnCode>Model } from './<var_txnCode>.model'
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
  tioa = {
<var_tioaDeclare>
    DGPage: number
  }

  cbData = {
<var_cbDataDeclare>
  }

  <var_txnCode>GridOptions: GridOptions
  <var_txnCode>RowData: <var_txnCode>Model
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
        headerName: '??????',
        field: '',
        hide: !this.hasAuth('AddEditDel'),
        cellRenderer: 'gridButtonRenderer',
        cellRendererParams: {
          text: '??????',
          click: async (selectedRow: <var_txnCode>GridModel) => await this.viewOrEditClick(selectedRow)
        },
        width: 75
      }, {
        headerName: '??????',
        field: '',
        hide: !this.hasAuth('AddEditDel'),
        cellRenderer: 'gridButtonRenderer',
        cellRendererParams: {
          text: '??????',
          click: async (selectedRow: <var_txnCode>GridModel) => await this.viewOrEditClick(selectedRow)
        },
        width: 75
      }, {
        headerName: '??????',
        field: '',
        hide: !this.hasAuth('AddEditDel'),
        cellRenderer: 'gridButtonRenderer',
        cellRendererParams: {
          text: '??????',
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
   * ?????? ComboBox Data ??????
   */
  async requestComboBox (): Promise<void> {
    const oCB = asComboBoxRequests({
<var_comboBoxContent>
    })

    this.cbData = _.assign({ }, this.cbData, await this.comboboxService.requestComboBox(oCB))
  }

  /**
   * ?????? ??????
   */
  exitTxn (): void {
    this.tabsService.searchRemoveTab(this.menuID)
    logger.info('Exit <var_txnCode> component')
  }

  /**
   * ??????
   *
   * @param status AddEditDel|Export|Print|Query
   * @returns ??????????????????
   */
  hasAuth (status: 'AddEditDel' | 'Export' | 'Print' | 'Query'): boolean {
    return this.tabsService.hasAuth(this.menuID, status)
  }
}
