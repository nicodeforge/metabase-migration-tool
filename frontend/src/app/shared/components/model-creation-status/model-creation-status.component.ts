import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CreateModelResponseDto } from '../../repositories/create-model-response.dto';
import { MetabaseModelTypeEnum } from '../../../feature/duplicate-dashboard/dto/model-with-dependencies.dto';

@Component({
  selector: 'app-model-creation-status',
  templateUrl: './model-creation-status.component.html',
  styleUrls: ['./model-creation-status.component.scss'],
})
export class ModelCreationStatusComponent {
  @Input() isLoaded!: boolean;
  @Input() modelType!: MetabaseModelTypeEnum;
  @Input() modelResponse!: CreateModelResponseDto;
  @Output() onNavigate: EventEmitter<string> = new EventEmitter<string>();
  @Output() onRestart: EventEmitter<boolean> = new EventEmitter<boolean>();

  public modelTypeName: string =
    this.modelType === MetabaseModelTypeEnum.DASHBOARD ? 'dashboard' : 'card';

  public onNavigateToModel() {
    this.onNavigate.emit(this.modelResponse.url);
  }

  public handleRestart() {
    this.onRestart.emit(true);
  }
}
