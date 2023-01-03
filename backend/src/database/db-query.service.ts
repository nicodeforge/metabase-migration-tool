import { Inject, Injectable } from '@nestjs/common';
import { DbQuery } from './db-query';
import { DataSource, QueryRunner } from 'typeorm';
import { MB_STAGING_DATA_SOURCE } from './metabase-staging-connection.module';
import { InstanceTypeEnum } from './instance-type.enum';
import { MB_PRODUCTION_DATA_SOURCE } from './metabase-production-connection.module';

@Injectable()
export class DbQueryService implements DbQuery {
  constructor(
    @Inject(MB_STAGING_DATA_SOURCE)
    private readonly stagingDataSource: DataSource,

    @Inject(MB_PRODUCTION_DATA_SOURCE)
    private readonly productionDataSource: DataSource,
  ) {}

  public async query(
    instance: InstanceTypeEnum,
    query: string,
  ): Promise<Array<any>> {
    try {
      let queryRunner!: QueryRunner;
      switch (instance) {
        case InstanceTypeEnum.production:
          queryRunner = await this.productionDataSource.createQueryRunner();
          break;
        case InstanceTypeEnum.staging:
          queryRunner = await this.stagingDataSource.createQueryRunner();
          break;

        default:
          console.log('Could not find the instance');
          break;
      }

      await queryRunner.connect();
      const res: Array<any> = await queryRunner.manager.query(query);
      await queryRunner.release();
      return res;
    } catch (error) {
      throw new Error(`Database request error`);
    }
  }
}
