import { NativeQueryDto } from './native-query.dto';
import { VisualQueryDto } from './visual-query.dto';

export class DataSetQuery {
  type: string;
  native?: NativeQueryDto;
  query?: VisualQueryDto;
  database: number;
}
