import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectionPromptComponent } from './components/connection-prompt/connection-prompt.component';
import { ModalComponent } from './components/modal/modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChipsModule } from 'primeng/chips';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { IntanceSelectComponent } from './components/intance-select/intance-select.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DependencyMappingComponent } from './components/dependency-mapping/dependency-mapping.component';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ProgressBarModule } from 'primeng/progressbar';
import { ModelCreationReviewComponent } from './components/model-creation-review/model-creation-review.component';
import { BadgeModule } from 'primeng/badge';
import { ModelCreationStatusComponent } from './components/model-creation-status/model-creation-status.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@NgModule({
  imports: [
    CommonModule,
    ChipsModule,
    ButtonModule,
    SelectButtonModule,
    ReactiveFormsModule,
    FormsModule,
    CardModule,
    TableModule,
    InputSwitchModule,
    ProgressBarModule,
    BadgeModule,
    ProgressSpinnerModule,
  ],
  declarations: [
    ConnectionPromptComponent,
    ModalComponent,
    IntanceSelectComponent,
    DependencyMappingComponent,
    ModelCreationReviewComponent,
    ModelCreationStatusComponent,
  ],
  providers: [DialogService],
  exports: [
    ConnectionPromptComponent,
    IntanceSelectComponent,
    DependencyMappingComponent,
    ModelCreationReviewComponent,
    ModelCreationStatusComponent,
  ],
})
export class SharedModule {}
