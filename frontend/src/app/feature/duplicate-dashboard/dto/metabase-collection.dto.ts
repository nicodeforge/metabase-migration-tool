export class MetabaseCollectionDto {
  id!: number;
  name!: string;

  slug!: string;

  location!: string;

  parent_id!: number | 'root';

  toCreate: boolean = false;
}
