import { MetabaseDashboardDto } from './metabase-dashboard.dto';
import { ReportCardDto } from './report-card.dto';
import { ReportDashboardCardDto } from './report-dashboardcard.dto';
import { MetabaseCollectionDto } from './metabase-collection.dto';

export class CreateDashboardDto {
  dashboard!: MetabaseDashboardDto;

  reportCards!: ReportCardDto[];
  reportDashboardCards!: ReportDashboardCardDto[];

  collections!: MetabaseCollectionDto[];
}
