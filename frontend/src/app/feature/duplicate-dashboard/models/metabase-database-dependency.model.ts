import { MetabaseDatabaseDto } from '../dto/metabase-database.dto';

export class MetabaseDatabaseDependencyModel {
  origin!: MetabaseDatabaseDto;

  existsInDestination?: boolean;

  isMapped: boolean = false;
  destination!: MetabaseDatabaseDto;
}
