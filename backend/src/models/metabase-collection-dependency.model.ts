import { MetabaseCollectionDto } from '../dto/metabase/metabase-collection.dto';

export interface MetabaseCollectionDependencyModel {
  origin: MetabaseCollectionDto;
  existsInDestination?: boolean;

  destination?: MetabaseCollectionDto;
}
