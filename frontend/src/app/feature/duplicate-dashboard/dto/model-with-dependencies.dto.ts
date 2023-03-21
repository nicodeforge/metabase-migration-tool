import { ApiDashboardDto } from '../api-dto/api-dashboard.dto';
import { ApiModelDependencyDto } from '../api-dto/api-model-dependency.dto';
import { ApiCardDto } from '../api-dto/api-card.dto';

export enum MetabaseModelTypeEnum {
  'DASHBOARD',
  'CARD',
}

export class ModelWithDependenciesDto {
  type!: MetabaseModelTypeEnum;
  origin!: ApiDashboardDto | ApiCardDto;
  existsInDestination!: boolean;
  dependencies!: ApiModelDependencyDto;
}
