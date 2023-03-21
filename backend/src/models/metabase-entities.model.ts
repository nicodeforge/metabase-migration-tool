import { OldMetabaseDashboardDto } from '../dto/old_metabase/old-metabase-dashboard.dto';
import { OldReportDashboardcardDto } from '../dto/old_metabase/old-report-dashboardcard.dto';
import { OldReportCardDto } from '../dto/old_metabase/old-report-card.dto';
import { MetabaseCollectionDto } from '../dto/metabase/metabase-collection.dto';
import { MetabaseCoreUserDto } from '../dto/metabase/metabase-core-user.dto';
import { OldMetabaseDatabaseDto } from '../dto/old_metabase/old-metabase-database.dto';
import { OldMetabaseTableDto } from '../dto/old_metabase/old-metabase-table.dto';

export interface MetabaseEntitiesModel {
  dashboard: OldMetabaseDashboardDto;
  reportDashboardCards?: OldReportDashboardcardDto[];

  reportCards?: OldReportCardDto[];

  collections?: MetabaseCollectionDto[];

  coreUsers?: MetabaseCoreUserDto[];

  databases?: OldMetabaseDatabaseDto[];
  tables?: OldMetabaseTableDto[];
}
