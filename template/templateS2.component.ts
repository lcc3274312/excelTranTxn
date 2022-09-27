import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { ComboData } from '@systex-f25b/esoaf-front/core/model'
import { MessageboxService, ValidateService } from '@systex-f25b/esoaf-front/core/component'
import { SocketService, ComboboxService, asComboBoxRequests } from '@systex-f25b/esoaf-front/core/service'
import { TabsService, StatusbarService } from '@systex-f25b/esoaf-front/platform'
import { getLogger } from '@systex-f25b/esoaf-front/utils'
import { <var_txnCode>Model } from './<var_txnCode>.model'
import _ from 'lodash'

const logger = getLogger(__filename)

export interface dialogShareData {
  menuID: string
  action: 'Edit' | 'Add' | 'View'
  rowData?: <var_txnCode>Model
}

@Component({
  selector: 'txn-<var_txnCode>s2',
  templateUrl: './<var_txnCode>S2.component.html',
  styleUrls: ['./<var_txnCode>.component.css']
})

/**
 * @description <var_txnName> 新增&修改&查看(<var_txnCode>S2)
 */
export class <var_txnCode>S2Component implements OnInit {
  @ViewChild('<var_txnCode>S2') el: ElementRef<HTMLDivElement>
  menuID: string
  title: string
  tioa: {
<var_tioaDeclare>
  }

  cbData: {
<var_cbDataDeclare>
  }

  viewMode: boolean
  EditMode: boolean

  constructor (
    private readonly socketService: SocketService,
    private readonly messageboxService: MessageboxService,
    private readonly statusbarService: StatusbarService,
    private readonly validateService: ValidateService,
    private readonly tabsService: TabsService,
    private readonly comboboxService: ComboboxService,
    private readonly dialogRef: MatDialogRef<<var_txnCode>S2Component, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: dialogShareData
  ) {
    this.menuID = this.data.menuID
    this.title = `<var_txnName>設定－${
      this.data.action === 'Add'
      ? '新增'
      : this.data.action === 'Edit'
      ? '修改'
      : '查看'}`
    this.tioa = this.data.action === 'Add' ? {
<vat_tioaImplement>
    } : _.assign({ }, this.tioa, this.data.rowData)

    this.cbData = {
<vat_cbDataImplement>
    }

    this.viewMode = this.data.action === 'View'
    this.EditMode = this.data.action === 'Edit'
  }

  async requestComboBox (): Promise<void> {
    const oCB = asComboBoxRequests({
<var_comboBoxContent>
    })
    this.cbData = _.assign({}, this.cbData, await this.comboboxService.requestComboBox(oCB))
  }

  async ngOnInit (): Promise<void> {
    logger.info('Init <var_txnCode>S2 component')
    await this.requestComboBox()
  }

  /**
   * 確認
   */
   async txnSubmit (): Promise<void> {
    try {
      this.statusbarService.clearMessage()
      if (!this.validateService.dataIsValid(this.el)) {
        return
      }
      const oTia: <var_txnCode>Model = {
        ...this.tioa
      }
      await this.socketService.sendRecv<<var_txnCode>Model, null>(this.menuID, 'AddEditDel', 'AddEdit', oTia)
      this.closeDialog(true)
    } catch (e) {
      logger.error('txnSubmit Error', e)
      void this.messageboxService.showErrorMessagebox(e)
    }
  }

  /**
   * @function 檢核－管理權限
   * @param status 'AddEditDel|Export|Print|Query'
   */
  hasAuth (status: 'AddEditDel' | 'Export' | 'Print' | 'Query'): boolean {
    return this.tabsService.hasAuth(this.menuID, status)
  }

  /**
   * 關閉
   *
   * @param status 是否重新查詢
   */
  closeDialog (status: boolean): void {
    this.dialogRef.close(status)
    logger.info('Exit <var_txnCode>S2 component')
  }
}
