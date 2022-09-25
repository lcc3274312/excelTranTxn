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
import { PRD00001S2Component, dialogShareData } from './PRD00001S2.component'
import { DelRequest, QueryRequest, QueryResponse, PRD00001Model } from './PRD00001.model'
import _ from 'lodash'

const logger = getLogger(__filename)

@Component({
  selector: 'txn-PRD00001',
  templateUrl: './PRD00001.component.html'
})

/**
 * @description  壽險主檔 (PRD00001)
 */
export class PRD00001Component implements OnInit {
  @ViewChild('PRD00001') el: ElementRef<HTMLDivElement>
  menuID: string
  tioa = {
		planCode: string			//
		dispPlanCode: string			//
		dispPlanName: string			//
		planType: string			//
		dispPlanType: string			//
		bgnDate: string			//
		endDate: string			//

    DGPage: number
  }

  cbData = {
		planType: ComboData[]
		dispPlanType: ComboData[]
		payGoType: ComboData[]
		isMain: ComboData[]
		isMultiKind: ComboData[]
		isMultiCuy: ComboData[]
		cuy: ComboData[]
		insObject: ComboData[]
		isSamePerson: ComboData[]
		sex: ComboData[]
		insBgnJobGrade: ComboData[]
		insEndJobGrade: ComboData[]
		amtInputType: ComboData[]
		waiverAmtType: ComboData[]
		payFreq: ComboData[]
		firstPayWay: ComboData[]
		renewPayWay: ComboData[]
		isGroupPay: ComboData[]
		premType: ComboData[]
		deathBenefitType: ComboData[]
		agedRecord: ComboData[]

  }

  PRD00001GridOptions: GridOptions
  PRD00001RowData: PRD00001Model
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
    this.menuID = 'PRD00001'
    this.tioa = {
			planCode: '',			//
			dispPlanCode: '',			//
			dispPlanName: '',			//
			planType: '',			//
			dispPlanType: '',			//
			bgnDate: '',			//
			endDate: '',			//

      DGPage: 0
    }

    this.cbData = {
			planType: []
			dispPlanType: []
			payGoType: []
			isMain: []
			isMultiKind: []
			isMultiCuy: []
			cuy: []
			insObject: []
			isSamePerson: []
			sex: []
			insBgnJobGrade: []
			insEndJobGrade: []
			amtInputType: []
			waiverAmtType: []
			payFreq: []
			firstPayWay: []
			renewPayWay: []
			isGroupPay: []
			premType: []
			deathBenefitType: []
			agedRecord: []

    }

    this.hasLastPage = false
    this.hasNextPage = false

    this.PRD00001GridOptions = {
      ...GridDefaultOption,
      columnDefs: [{
        headerName: '查看',
        field: '',
        hide: !this.hasAuth('AddEditDel'),
        cellRenderer: 'gridButtonRenderer',
        cellRendererParams: {
          text: '查看',
          click: async (selectedRow: PRD00001GridModel) => await this.viewOrEditClick(selectedRow)
        },
        width: 75
      }, {
        headerName: '修改',
        field: '',
        hide: !this.hasAuth('AddEditDel'),
        cellRenderer: 'gridButtonRenderer',
        cellRendererParams: {
          text: '修改',
          click: async (selectedRow: PRD00001GridModel) => await this.viewOrEditClick(selectedRow)
        },
        width: 75
      }, {
        headerName: '刪除',
        field: '',
        hide: !this.hasAuth('AddEditDel'),
        cellRenderer: 'gridButtonRenderer',
        cellRendererParams: {
          text: '刪除',
          click: async (selectedRow: PRD00001GridModel) => await this.delClick(selectedRow)
        },
        width: 75
      }, {
        headerName: '商品代碼',
        field: 'planCode',
        width: 135
      }, {
        headerName: '顯示商品代碼',
        field: 'dispPlanCode',
        width: 135
      }, {
        headerName: '顯示商品名稱',
        field: 'dispPlanName',
        width: 135
      }, {
        headerName: '商品類型',
        field: 'planType',
        width: 135
      }, {
        headerName: '顯示商品類型',
        field: 'dispPlanType',
        width: 135
      }, {
        headerName: '開始日期',
        field: 'bgnDate',
        width: 135
      }, {
        headerName: '結束日期',
        field: 'endDate',
        width: 135
      }
      ],
      frameworkComponents: {
        gridSelectRender: GridSelectRendererComponent,
        gridTextRender: GridTextRendererComponent,
        gridButtonRenderer: GridButtonRendererComponent,
      }
    }
  }

  /**
   * 定義 ComboBox Data 欄位
   */
  async requestComboBox (): Promise<void> {
    const oCB = asComboBoxRequests({
			planType: ['0', '*', 'Asc']
			dispPlanType: ['0', '*', 'Asc']
			payGoType: ['042', false, 'Asc']
			isMain: ['001', false, 'Asc']
			isMultiKind: ['001', false, 'Asc']
			isMultiCuy: ['001', false, 'Asc']
			cuy: ['014', false, 'Asc']
			insObject: ['005', false, 'Asc']
			isSamePerson: ['001', false, 'Asc']
			sex: ['006', false, 'Asc']
			insBgnJobGrade: ['007', false, 'Asc']
			insEndJobGrade: ['007', false, 'Asc']
			amtInputType: ['008', false, 'Asc']
			waiverAmtType: ['009', false, 'Asc']
			payFreq: ['010', false, 'Asc']
			firstPayWay: ['011', false, 'Asc']
			renewPayWay: ['031', false, 'Asc']
			isGroupPay: ['001', false, 'Asc']
			premType: ['013', false, 'Asc']
			deathBenefitType: ['039', false, 'Asc']
			agedRecord: ['001', false, 'Asc']

    })

    this.cbData = _.assign({ }, this.cbData, await this.comboboxService.requestComboBox(oCB))
  }

  /**
   * 關閉 按鈕
   */
  exitTxn (): void {
    this.tabsService.searchRemoveTab(this.menuID)
    logger.info('Exit PRD00001 component')
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
}
