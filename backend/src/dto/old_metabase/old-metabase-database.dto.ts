import { MetabaseDatabaseSchemaModel } from '../../models/metabase-database-schema.model';
import { TableDto } from '../metabase/table.dto';

export class OldMetabaseDatabaseDto {
  id: number;
  name: string;

  tables?: TableDto[] | MetabaseDatabaseSchemaModel[];
}
