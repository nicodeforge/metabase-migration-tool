export class CollectionTreeDto {
  constructor(
    public index: number,
    public id: number,
    public name: string,
    public direct_parent?: CollectionTreeDto,
  ) {}
}
