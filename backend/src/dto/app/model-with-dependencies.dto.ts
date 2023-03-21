import { MetabaseModelTypeEnum } from '../../controllers/metabase-model-type.enum';
import { DashboardDto } from '../metabase/dashboard.dto';
import { CardDto } from '../metabase/card.dto';
import { ApiModelDependencyDto } from './api-model-dependency.dto';

export class ModelWithDependenciesDto {
  type!: MetabaseModelTypeEnum;
  origin!: DashboardDto | CardDto;
  existsInDestination!: boolean;
  dependencies!: ApiModelDependencyDto;
}
