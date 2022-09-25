import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

import { CoreComponentModule } from '@systex-f25b/esoaf-front/core/component'
import { PlatformModule } from '@systex-f25b/esoaf-front/platform'

import { PRD00001Component } from './PRD00001.component'
import { PRD00001S2Component } from './PRD00001S2.component'

@NgModule({
  declarations: [
    PRD00001Component,
    PRD00001S2Component
  ],
  imports: [
    CoreComponentModule,
    PlatformModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

/**
 * @description 壽險主檔 設定 (PRD00001)
 */
export class PRD00001Module {
  static entry = PRD00001Component
}
