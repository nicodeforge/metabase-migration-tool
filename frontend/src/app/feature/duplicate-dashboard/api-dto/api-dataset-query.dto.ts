import { NativeQueryDto } from './api-native-query.dto';

export class DataSetQuery {
  type!: string;
  native?: NativeQueryDto;
  database!: number;
}
