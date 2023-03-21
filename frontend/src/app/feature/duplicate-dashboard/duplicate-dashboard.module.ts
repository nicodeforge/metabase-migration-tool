import { NgModule } from '@angular/core';
import { CopyDashboardAcrossInstanceComponent } from './components/copy-dashboard-across-instance/copy-dashboard-across-instance.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { HttpClientModule } from '@angular/common/http';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { DuplicateDashboardRoutingModule } from './duplicate-dashboard-routing.module';
import { DuplicateDashboardService } from './services/duplicate-dashboard.service';
import { DuplicateDashboardRepository } from './repositories/duplicate-dashboard.repository';
import { StepsModule } from 'primeng/steps';
import { TableModule } from 'primeng/table';
import { ChipsModule } from 'primeng/chips';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MultiSelectModule } from 'primeng/multiselect';
import { PanelModule } from 'primeng/panel';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { TableListComponent } from './components/table-list/table-list.component';
import { ListboxModule } from 'primeng/listbox';
import { BadgeModule } from 'primeng/badge';

@NgModule({
  declarations: [CopyDashboardAcrossInstanceComponent, TableListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    HttpClientModule,
    SelectButtonModule,
    CardModule,
    InputNumberModule,
    DuplicateDashboardRoutingModule,
    StepsModule,
    TableModule,
    ChipsModule,
    FormsModule,
    InputSwitchModule,
    ProgressSpinnerModule,
    MultiSelectModule,
    PanelModule,
    DynamicDialogModule,
    ListboxModule,
    BadgeModule,
  ],
  providers: [
    DuplicateDashboardService,
    DuplicateDashboardRepository,
    DialogService,
    //MetabaseInstanceService,
  ],
  exports: [CopyDashboardAcrossInstanceComponent],
})
export class DuplicateDashboardModule {}
