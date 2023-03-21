import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { InstanceCreateComponent } from './components/instance-create/instance-create.component';
import { InstanceListComponent } from './components/instance-list/instance-list.component';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MetabaseInstanceRoutingModule } from './metabase-instance-routing.module';
import { InputTextModule } from 'primeng/inputtext';
import { DialogService } from 'primeng/dynamicdialog';
import { SharedModule } from 'primeng/api';

@NgModule({
  declarations: [InstanceCreateComponent, InstanceListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MetabaseInstanceRoutingModule,
    TableModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    SharedModule,
  ],
  providers: [DialogService],
  exports: [InstanceCreateComponent, InstanceListComponent],
})
export class MetabaseInstanceModule {}
