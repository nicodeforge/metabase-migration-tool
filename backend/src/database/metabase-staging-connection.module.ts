import { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { DataSource } from 'typeorm';

export const MB_STAGING_DATA_SOURCE = Symbol();

const metabaseStagingDataSourceConfiguration: DataSourceOptions = {
  type: 'postgres',
  host: process.env.MB_STAGING_DB_HOST || '172.19.0.2',
  port: parseInt(process.env.MB_STAGING_DB_PORT) || 5432,
  username: process.env.MB_STAGING_DB_USER || 'metabase',
  password: process.env.MB_STAGING_DB_PASS || 'metabase-staging',
  database: process.env.MB_STAGING_DB_NAME || 'metabase',
  synchronize: false,
};

@Global()
@Module({})
export class DbMetabaseStagingConnectionModule {
  public static async forRoot(): Promise<DynamicModule> {
    const metabaseStagingDataSource: DataSource = new DataSource(
      metabaseStagingDataSourceConfiguration,
    );

    await metabaseStagingDataSource.initialize();

    return {
      module: DbMetabaseStagingConnectionModule,
      providers: [
        {
          provide: MB_STAGING_DATA_SOURCE,
          useValue: metabaseStagingDataSource,
        },
      ],
      exports: [MB_STAGING_DATA_SOURCE],
    };
  }
}
