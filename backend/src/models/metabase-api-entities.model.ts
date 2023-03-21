import { OldReportDashboardcardDto } from '../dto/old_metabase/old-report-dashboardcard.dto';
import { OldReportCardDto } from '../dto/old_metabase/old-report-card.dto';
import { MetabaseCollectionDto } from '../dto/metabase/metabase-collection.dto';
import { MetabaseCoreUserDto } from '../dto/metabase/metabase-core-user.dto';
import { OldMetabaseDatabaseDto } from '../dto/old_metabase/old-metabase-database.dto';
import { OldMetabaseTableDto } from '../dto/old_metabase/old-metabase-table.dto';
import { DashboardDto } from '../dto/metabase/dashboard.dto';

export interface MetabaseApiEntitiesModel {
  dashboard: DashboardDto;
  reportDashboardCards?: OldReportDashboardcardDto[];

  reportCards?: OldReportCardDto[];

  collections?: MetabaseCollectionDto[];

  coreUsers?: MetabaseCoreUserDto[];

  databases?: OldMetabaseDatabaseDto[];
  tables?: OldMetabaseTableDto[];
}
