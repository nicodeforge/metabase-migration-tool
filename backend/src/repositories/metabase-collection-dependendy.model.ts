import { MetabaseCollectionDto } from './metabase-collection.dto';

export interface MetabaseCollectionDependendyModel {
  collection: MetabaseCollectionDto;
  existsInDestination?: boolean;
}
