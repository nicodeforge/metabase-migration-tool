import { MetabaseCollectionDto } from '../dto/metabase-collection.dto';

export class MetabaseCollectionDependencyModel {
  origin!: MetabaseCollectionDto;
  existsInDestination?: boolean;

  isMapped: boolean = false;
  destination!: MetabaseCollectionDto;

  createInDestination?: boolean;
}
