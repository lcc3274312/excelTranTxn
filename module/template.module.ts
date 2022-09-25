import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

import { CoreComponentModule } from '@systex-f25b/esoaf-front/core/component'
import { PlatformModule } from '@systex-f25b/esoaf-front/platform'

import { <var_txnCode>Component } from './<var_txnCode>.component'
import { <var_txnCode>S2Component } from './<var_txnCode>S2.component'

@NgModule({
  declarations: [
    <var_txnCode>Component,
    <var_txnCode>S2Component
  ],
  imports: [
    CoreComponentModule,
    PlatformModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

/**
 * @description <var_txnName> 設定 (<var_txnCode>)
 */
export class <var_txnCode>Module {
  static entry = <var_txnCode>Component
}
