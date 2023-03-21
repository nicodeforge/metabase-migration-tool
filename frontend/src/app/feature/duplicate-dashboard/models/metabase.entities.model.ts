import { MetabaseDashboardDto } from '../dto/metabase-dashboard.dto';
import { MetabaseCoreUserDto } from '../dto/metabase-core-user.dto';
import { ReportDashboardCardDto } from '../dto/report-dashboardcard.dto';
import { ReportCardDto } from '../dto/report-card.dto';
import { MetabaseCollectionDto } from '../dto/metabase-collection.dto';
import { MetabaseDatabaseDto } from '../dto/metabase-database.dto';
import { MetabaseTableDto } from '../dto/metabase-table.dto';

export interface MetabaseEntitiesModel {
  dashboard: MetabaseDashboardDto;
  reportDashboardCards: ReportDashboardCardDto[];

  reportCards: ReportCardDto[];

  collections: MetabaseCollectionDto[];

  coreUsers?: MetabaseCoreUserDto[];

  databases?: MetabaseDatabaseDto[];
  tables?: MetabaseTableDto[];
}
