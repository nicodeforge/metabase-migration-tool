import { DashboardDto } from './dashboard.dto';
import { DashboardDependencyDto } from './dashboard-dependency.dto';

export class DashboardWithDependenciesDto {
  dashboard: DashboardDto;

  existsInDestination: boolean;

  dependencies: DashboardDependencyDto;
}
