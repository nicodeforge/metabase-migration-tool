import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MetabaseModelTypeEnum } from '../../../feature/duplicate-dashboard/dto/model-with-dependencies.dto';
import { CreateModelDto } from '../../repositories/create-model.dto';
import { MetabaseInstanceDto } from '../../../feature/metabase-instance/dto/metabase-instance.dto';
import { CreateApiDashboardDto } from '../../../feature/duplicate-dashboard/api-dto/create-api-dashboard.dto';
import { ApiDashboardDto } from '../../../feature/duplicate-dashboard/api-dto/api-dashboard.dto';

@Component({
  selector: 'app-model-creation-review',
  templateUrl: './model-creation-review.component.html',
  styleUrls: ['./model-creation-review.component.scss'],
})
export class ModelCreationReviewComponent implements OnInit {
  @Input() modelType!: MetabaseModelTypeEnum;
  @Input() modelToCreate!: CreateModelDto;
  @Input() destinationInstance!: MetabaseInstanceDto;
  @Output() confirm: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() step: EventEmitter<number> = new EventEmitter<number>();
  public modelTypeName!: string;

  public dashboardToCreate!: CreateApiDashboardDto | null;
  public ngOnInit() {
    this.modelTypeName =
      this.modelType === MetabaseModelTypeEnum.CARD ? 'Card' : 'Dashboard';

    if (this.modelType === MetabaseModelTypeEnum.DASHBOARD) {
      this.dashboardToCreate = {
        dashboard: this.modelToCreate.model as ApiDashboardDto,
        collections: this.modelToCreate.collections,
      };
    }
  }

  public onPreviousStep(): void {
    this.step.emit(-1);
  }

  public onSubmit(): void {
    this.confirm.emit(true);
  }
}
