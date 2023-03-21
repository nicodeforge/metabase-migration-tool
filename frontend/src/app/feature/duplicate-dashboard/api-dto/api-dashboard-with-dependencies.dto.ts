import { ApiDashboardDto } from './api-dashboard.dto';
import { ApiModelDependencyDto } from './api-model-dependency.dto';

export class ApiDashboardWithDependenciesDto {
  dashboard!: ApiDashboardDto;

  existsInDestination!: boolean;

  dependencies!: ApiModelDependencyDto;
}
