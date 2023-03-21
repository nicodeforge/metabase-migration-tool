import { MetabaseDatabaseSchemaModel } from '../models/metabase-database-schema.model';

export class MetabaseDatabaseDto {
  id!: number;
  name!: string;

  schemas?: MetabaseDatabaseSchemaModel[];
}
