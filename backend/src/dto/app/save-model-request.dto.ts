import { MetabaseModelTypeEnum } from '../../controllers/metabase-model-type.enum';
import { CardDto } from '../metabase/card.dto';
import { DashboardDto } from '../metabase/dashboard.dto';
import { MetabaseCollectionDto } from '../metabase/metabase-collection.dto';
export class CreateModelDto {
  constructor(
    public type: MetabaseModelTypeEnum,
    public model: DashboardDto | CardDto,
    public collections: MetabaseCollectionDto[],
  ) {}
}
export interface SaveModelRequestDto {
  modelType: MetabaseModelTypeEnum;
  originInstanceId: string;
  destinationInstanceId: string;
  model: CreateModelDto;
}
