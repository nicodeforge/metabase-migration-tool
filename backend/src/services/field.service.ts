import { Injectable } from '@nestjs/common';
import { FieldRepository } from '../repositories/metabase/field.repository';
import { InstanceEntity } from '../instance/instance.entity';
import { TableService } from './table.service';
import { DatabaseService } from './database.service';

@Injectable()
export class FieldService {
  constructor(
    private readonly fieldRepository: FieldRepository,
    private tableService: TableService,
    private databaseService: DatabaseService,
  ) {}

  public async findOneById(instance: InstanceEntity, fieldId: number) {
    return await this.fieldRepository.findOneById(instance, fieldId);
  }

  public async findOriginFieldIdInDestination(
    originInstance: InstanceEntity,
    destinationInstance: InstanceEntity,
    fieldId: number,
  ): Promise<number> {
    const originField = await this.findOneById(originInstance, fieldId);

    const destinationTables = await this.tableService.findAll(
      destinationInstance,
    );

    let destinationTable = destinationTables.find(
      (table) =>
        table.name === originField.table.name &&
        table.schema === originField.table.schema,
    );

    const destinationDatabase = await this.databaseService.findOneById(
      destinationInstance,
      destinationTable.db_id,
    );

    destinationTable = destinationDatabase.tables.find(
      (table) =>
        table.name === destinationTable.name &&
        table.schema === destinationTable.schema,
    );

    const destinationField = destinationTable.fields.find(
      (field) => field.name === originField.name,
    );

    if (destinationField?.id) {
      return destinationField.id;
    } else {
      throw new Error(
        `Could not find destination field ID for original field #${originField.id}`,
      );
    }
  }
}
