import { ApiTableDto } from './api-table.dto';

export class ApiDatabaseInfoDto {
  id!: number;
  name!: string;

  tables!: ApiTableDto[];
}
