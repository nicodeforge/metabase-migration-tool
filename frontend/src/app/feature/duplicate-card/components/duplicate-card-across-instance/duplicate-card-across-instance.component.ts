import { Component, OnInit } from '@angular/core';
import { MetabaseInstanceDto } from '../../../metabase-instance/dto/metabase-instance.dto';
import { SelectedInstances } from '../../../../shared/components/intance-select/intance-select.component';
import { ApiCardDto } from '../../../duplicate-dashboard/api-dto/api-card.dto';
import { CardService } from '../../services/card.service';
import { MetabaseModelTypeEnum } from '../../../duplicate-dashboard/dto/model-with-dependencies.dto';
import { CreateModelDto } from '../../../../shared/repositories/create-model.dto';
import { CreateModelRequestDto } from '../../../../shared/repositories/create-model-request.dto';
import { ModelService } from '../../../../shared/services/model.service';
import { CreateModelResponseDto } from '../../../../shared/repositories/create-model-response.dto';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-duplicate-card-across-instance',
  templateUrl: './duplicate-card-across-instance.component.html',
  styleUrls: ['./duplicate-card-across-instance.component.scss'],
})
export class DuplicateCardAcrossInstanceComponent implements OnInit {
  public originInstance: MetabaseInstanceDto = new MetabaseInstanceDto();
  public destinationInstance: MetabaseInstanceDto = new MetabaseInstanceDto();
  public cards!: ApiCardDto[];
  public originCard!: ApiCardDto;
  public isLoading = false;
  public step!: number;
  public modelType: MetabaseModelTypeEnum = MetabaseModelTypeEnum.CARD;
  public modelToCreate!: CreateModelDto;
  public modelCreationResponse!: CreateModelResponseDto;
  public resetInstanceSelectForm: Subject<boolean> = new Subject<boolean>();

  constructor(
    private cardService: CardService,
    private modelService: ModelService
  ) {}

  ngOnInit() {
    this.step = 1;
  }

  public async onInstancesSelected($event: SelectedInstances) {
    this.originInstance = $event.origin;
    this.destinationInstance = $event.destination;
    this.isLoading = true;
    this.cards = await this.getCards(this.originInstance);
    this.cards = this.cards.map((card) => {
      card.display_name = card.name + '(#' + card.id + ')';
      return card;
    });
  }

  private async getCards(instance: MetabaseInstanceDto): Promise<ApiCardDto[]> {
    return await this.cardService.getCards(instance);
  }

  onSelectCard(cardId: number) {
    const selectedCard = this.cards.find((card) => card.id === cardId);
    if (selectedCard) {
      this.originCard = selectedCard;
    }
  }

  onSubmitStep1(): void {
    this.step++;
  }

  onSubmitStep2($event: CreateModelDto) {
    this.step++;
    this.modelToCreate = $event;
    console.log($event);
  }

  onSubmitStep3($event: boolean) {
    const saveModelRequest: CreateModelRequestDto = {
      modelType: this.modelType,
      originInstanceId: this.originInstance.id,
      destinationInstanceId: this.destinationInstance.id,
      model: this.modelToCreate,
    };

    if ($event) {
      this.step++;
      this.modelService.saveModel(saveModelRequest).subscribe((response) => {
        this.modelCreationResponse = response;
        this.isLoading = false;
        console.log(response);
      });
    }
  }

  public handleNavigateToModel(url: string) {
    (window as any).open(url, '_blank');
  }

  public handleRestart(doRestart: boolean) {
    if (doRestart) {
      this.resetInstanceSelectForm.next(true);
      this.step = 1;
    }
  }
}
