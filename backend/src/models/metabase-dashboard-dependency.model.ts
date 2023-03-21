import { DashboardDto } from '../dto/metabase/dashboard.dto';

export interface MetabaseDashboardDependencyModel {
  origin: DashboardDto;
  existsInDestination?: boolean;
  destination: DashboardDto;
}
