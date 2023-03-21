export class MetabaseCollectionAncestor {
  name: string;
  id: string;
}

export class MetabaseCollectionDto {
  id: number;
  name: string;
  location: string;

  slug?: string;

  parent_id: number | 'root';

  color: string;

  path?: string;

  effective_ancestors?: MetabaseCollectionAncestor[];

  toCreate?: boolean;
}
