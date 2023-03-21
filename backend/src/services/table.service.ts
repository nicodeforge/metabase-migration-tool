import { Injectable } from '@nestjs/common';
import { TableRepository } from '../repositories/metabase/table.repository';
import { TableDto } from '../dto/metabase/table.dto';
import { InstanceEntity } from '../instance/instance.entity';

@Injectable()
export class TableService {
  constructor(private readonly tableRepository: TableRepository) {}

  public async findAll(instance: InstanceEntity): Promise<TableDto[]> {
    return await this.tableRepository.getAllTables(instance);
  }

  public async getOriginTableInDestination(
    originInstance: InstanceEntity,
    destinationInstance: InstanceEntity,
    tableId: number,
  ): Promise<TableDto> {
    const destinationTables = await this.findAll(destinationInstance);

    const originTables = await this.findAll(originInstance);

    const originTable = originTables.find((table) => table.id === tableId);

    return destinationTables.find(
      (table) =>
        originTable.name === table.name && originTable.schema === table.schema,
    );
  }
}
