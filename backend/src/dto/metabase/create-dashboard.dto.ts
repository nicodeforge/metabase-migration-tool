import { DashboardDto } from './dashboard.dto';
import { MetabaseCollectionDto } from './metabase-collection.dto';

export class CreateDashboardDto {
  dashboard!: DashboardDto;

  collections!: MetabaseCollectionDto[];
}
