import { TableDto } from './table.dto';
import { FieldDto } from './field.dto';

export class DatabaseInfoDto {
  id: number;
  name: string;

  tables: TableDto[];

  fields?: FieldDto[];
}
