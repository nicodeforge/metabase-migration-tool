import { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { DataSource } from 'typeorm';

export const MB_PRODUCTION_DATA_SOURCE = Symbol();

const metabaseProductionDataSourceConfiguration: DataSourceOptions = {
  type: 'postgres',
  host: process.env.MB_PRODUCTION_DB_HOST || '172.18.0.2',
  port: 5432,
  username: 'metabase',
  password: 'metabase-production',
  database: 'metabase',
  synchronize: false,
};

@Global()
@Module({})
export class DbMetabaseProductionConnectionModule {
  public static async forRoot(): Promise<DynamicModule> {
    const metabaseProductionDataSource: DataSource = new DataSource(
      metabaseProductionDataSourceConfiguration,
    );

    await metabaseProductionDataSource.initialize();

    return {
      module: DbMetabaseProductionConnectionModule,
      providers: [
        {
          provide: MB_PRODUCTION_DATA_SOURCE,
          useValue: metabaseProductionDataSource,
        },
      ],
      exports: [MB_PRODUCTION_DATA_SOURCE],
    };
  }
}
