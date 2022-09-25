import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { ComboData } from '@systex-f25b/esoaf-front/core/model'
import { MessageboxService, ValidateService } from '@systex-f25b/esoaf-front/core/component'
import { SocketService, ComboboxService, asComboBoxRequests } from '@systex-f25b/esoaf-front/core/service'
import { TabsService } from '@systex-f25b/esoaf-front/platform'
import { getLogger } from '@systex-f25b/esoaf-front/utils'
import { EditRequest, AddRequest, <var_txnCode>Model } from './<var_txnCode>.model'

import _ from 'lodash'

const logger = getLogger(__filename)

export interface <var_txnCode>S2ComponentData {
  menuID: string
  action: 'Edit' | 'Add' | 'View'
  row?: <var_txnCode>Model
}

@Component({
  selector: 'txn-<var_txnCode>s2',
  templateUrl: './<var_txnCode>s2.component.html'
})

/**
 * @description e投保欄位顯示規則設定 新增&修改(<var_txnCode>S2)
 */
export class <var_txnCode>S2Component implements OnInit {
  @ViewChild('<var_txnCode>S2') el: ElementRef<HTMLDivElement>
  menuID: string
  title: string
  tioa: {
<var_tioaDeclare>
  }

  viewMode: boolean
  cbData: {
<var_cbDataDeclare>
  }

  constructor (
    private readonly socketService: SocketService,
    private readonly messageboxService: MessageboxService,
    private readonly tabsService: TabsService,
    private readonly comboboxService: ComboboxService,
    private readonly validateService: ValidateService,
    private readonly dialogRef: MatDialogRef<<var_txnCode>S2Component, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: <var_txnCode>S2ComponentData
  ) {
    this.menuID = this.data.menuID
    this.title = '<var_txnName>>設定'
    this.tioa = this.data.action === 'Add' ? {
<vat_tioaImplement>
    } : {

    }

    this.cbData = {
<vat_cbDataImplement>
    }

    this.viewMode = (this.data.action === 'View')
  }

  async requestComboBox (): Promise<void> {
    const oCB = asComboBoxRequests({
      ...this.data.cbData
    })
    this.cbData = await this.comboboxService.requestComboBox(oCB) ?? this.cbData
  }

  async ngOnInit (): Promise<void> {
    logger.info('Init <var_txnCode>S2 component')
    await this.requestComboBox()
  }

  /**
   * 送出點擊觸發
   */
  async onSubmitClick (): Promise<void> {
    if (!this.validateService.dataIsValid(this.el)) {
      return
    }

    this.isEdit ? await this.edit() : await this.add()
  }

  async edit (): Promise<void> {
    try {
      const oTia: EditRequest = _.pick(this.tioa, [
        'hideRuleCategory',
        'hideId',
        'hideMethod',
        'hideFields',
        'hideType',
        'argFields',
        'args',
        'remark',
        'begDate',
        'endDate',
        'oldBegDate'
      ])
      await this.socketService
        .sendRecv<EditRequest, null>(this.menuID, 'AddEditDel', 'Edit', oTia)
      this.closeDialog(true)
    } catch (e) {
      logger.error('edit Error', e)
      void this.messageboxService.showErrorMessagebox(e)
    }
  }

  async add (): Promise<void> {
    try {
      const oTia: AddRequest = _.pick(this.tioa, [
        'hideRuleCategory',
        'hideId',
        'hideMethod',
        'hideFields',
        'hideType',
        'argFields',
        'args',
        'remark',
        'begDate',
        'endDate'
      ])

      await this.socketService.sendRecv<AddRequest, null>(this.menuID, 'AddEditDel', 'Add', oTia)
      this.closeDialog(true)
    } catch (e) {
      logger.error('add Error', e)
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
