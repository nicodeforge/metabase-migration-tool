import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DuplicateCardAcrossInstanceComponent } from './components/duplicate-card-across-instance/duplicate-card-across-instance.component';
import { DuplicateCardRoutingModule } from './duplicate-card-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { CardModule } from 'primeng/card';
import { CardService } from './services/card.service';
import { CardRepository } from './repositories/card.repository';
import { MultiSelectModule } from 'primeng/multiselect';
import { SpinnerModule } from 'primeng/spinner';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';

@NgModule({
  declarations: [DuplicateCardAcrossInstanceComponent],
  imports: [
    CommonModule,
    DuplicateCardRoutingModule,
    SharedModule,
    CardModule,
    MultiSelectModule,
    SpinnerModule,
    ProgressBarModule,
    ButtonModule,
  ],
  providers: [CardService, CardRepository],
})
export class DuplicateCardModule {}
