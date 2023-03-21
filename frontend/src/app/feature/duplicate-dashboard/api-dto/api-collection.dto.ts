export class ApiCollectionDto {
  id!: number;

  name!: string;

  slug?: string;
  location!: string;

  color!: string;

  parent_id!: number | 'root';

  toCreate?: boolean;
}
