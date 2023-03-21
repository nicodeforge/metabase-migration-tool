export class DatabaseCheckSchemaRequestDto {
  originInstanceId!: string;
  originDatabaseId!: number;
  destinationInstanceId!: string;
  destinationDatabaseId!: number;
}
