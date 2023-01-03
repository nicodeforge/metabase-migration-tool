import { InstanceTypeEnum } from './instance-type.enum';

export const DB_QUERY = Symbol();

export interface DbQuery {
  query(instanceType: InstanceTypeEnum, query: string): Promise<Array<any>>;
}
