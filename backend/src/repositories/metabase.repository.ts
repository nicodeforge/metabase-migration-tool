import { Inject, Injectable } from '@nestjs/common';
import { DB_QUERY, DbQuery } from '../database/db-query';
import { ReportDashboardCardDto } from './report-dashboardcard.dto';
import { InstanceTypeEnum } from '../database/instance-type.enum';
import { ReportCardDto } from './report-card.dto';
import { MetabaseCoreUserDto } from './metabase-core-user.dto';
import { MetabaseDatabaseDto } from './metabase-database.dto';
import { MetabaseTableDto } from './metabase-table.dto';
import { MetabaseCollectionDto } from './metabase-collection.dto';
import { MetabaseDashboardDto } from './metabase-dashboard.dto';

@Injectable()
export class MetabaseRepository {
  public async getReportDashboardCards(
    instance: InstanceTypeEnum,
    dashboardId: number,
  ): Promise<ReportDashboardCardDto[]> {
    return await this.dbQuery.query(
      instance,
      `
      SELECT * FROM report_dashboardcard WHERE dashboard_id = ${dashboardId};
    `,
    );
  }

  constructor(
    @Inject(DB_QUERY)
    private readonly dbQuery: DbQuery,
  ) {}

  public async getReportCard(
    instance: InstanceTypeEnum,
    cardId: number,
  ): Promise<ReportCardDto> {
    const reportCard = await this.dbQuery.query(
      instance,
      `
      SELECT report_card.*
      FROM report_card
      WHERE id = ${cardId};
    `,
    );

    return reportCard[0] ?? null;
  }

  public async getCoreUser(
    instance: InstanceTypeEnum,
    userId: number,
  ): Promise<MetabaseCoreUserDto> {
    const coreUser = await this.dbQuery.query(
      instance,
      `
      SELECT id,email from core_user where id = ${userId};
    `,
    );

    return coreUser[0] ?? null;
  }

  public async getMetabaseDatabase(
    instance: InstanceTypeEnum,
    databaseId: number,
  ): Promise<MetabaseDatabaseDto> {
    const metabaseDatabase = await this.dbQuery.query(
      instance,
      `
      SELECT id,name from metabase_database where id = ${databaseId};
    `,
    );

    return metabaseDatabase[0] ?? null;
  }

  public async getMetabaseTable(
    instance: InstanceTypeEnum,
    tableId: number,
  ): Promise<MetabaseTableDto> {
    const metabaseTable = await this.dbQuery.query(
      instance,
      `
      SELECT id,name from metabase_table where id = ${tableId};
    `,
    );

    return metabaseTable[0] ?? null;
  }

  public async getMetabaseCollection(
    instance: InstanceTypeEnum,
    collectionId: number,
  ): Promise<MetabaseCollectionDto> {
    const metabaseCollection = await this.dbQuery.query(
      instance,
      `
      SELECT id, name from collection where id = ${collectionId};
    `,
    );

    return metabaseCollection[0] ?? null;
  }

  public async getMetabaseDashboard(
    instance: InstanceTypeEnum,
    dashboardId: number,
  ): Promise<MetabaseDashboardDto> {
    const metabaseDashboard = await this.dbQuery.query(
      instance,
      `
      SELECT id, name from report_dashboard where id = ${dashboardId};
    `,
    );

    return metabaseDashboard[0] ?? null;
  }
}
