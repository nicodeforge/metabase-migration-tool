import { OldDashboardDependencyDto } from './old-dashboard-dependency.dto';
import { MetabaseEntitiesModel } from '../../models/metabase-entities.model';

export class OldDashboardWithDependenciesDto {
  entities: MetabaseEntitiesModel;

  dependencies: OldDashboardDependencyDto;
}
