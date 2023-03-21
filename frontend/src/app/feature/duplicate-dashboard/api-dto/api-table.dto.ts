import { ApiFieldDto } from './api-field.dto';

export class ApiTableDto {
  id!: number;
  name!: string;
  db_id!: number;

  schema!: string;

  show_in_getting_started!: boolean;
  entity_type!: string;
  updated_at!: Date;
  active!: boolean;
  field_order!: string;
  display_name!: string;
  created_at!: Date;

  fields?: ApiFieldDto[];
}
