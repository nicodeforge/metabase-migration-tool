import { OldMetabaseDashboardDto } from './old-metabase-dashboard.dto';
import { OldReportCardDto } from './old-report-card.dto';
import { OldReportDashboardcardDto } from './old-report-dashboardcard.dto';
import { MetabaseCollectionDto } from '../metabase/metabase-collection.dto';

export class OldCreateDashboardDto {
  dashboard!: OldMetabaseDashboardDto;

  reportCards!: OldReportCardDto[];
  reportDashboardCards!: OldReportDashboardcardDto[];

  collections!: MetabaseCollectionDto[];
}
