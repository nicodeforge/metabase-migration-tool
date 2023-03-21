import { Injectable } from '@nestjs/common';
import { InstanceEntity } from '../instance/instance.entity';
import { CardRepository } from '../repositories/metabase/card.repository';
import { CardDto } from '../dto/metabase/card.dto';
import { DashboardDto } from '../dto/metabase/dashboard.dto';
import { DataSetQuery } from '../dto/metabase/dataset-query.dto';
import { FieldService } from './field.service';
import { TableService } from './table.service';

@Injectable()
export class CardService {
  constructor(
    private readonly cardRepository: CardRepository,
    private fieldService: FieldService,
    private tableService: TableService,
  ) {}

  public async findOneById(
    instance: InstanceEntity,
    cardId: number,
  ): Promise<CardDto> {
    return await this.cardRepository.findOneById(instance, cardId);
  }

  public isCardModel(model: DashboardDto | CardDto): model is CardDto {
    return (model as CardDto).dataset_query !== undefined;
  }

  public async save(instance: InstanceEntity, card: CardDto): Promise<CardDto> {
    return await this.cardRepository.save(instance, card);
  }

  public async findAll(instance: InstanceEntity): Promise<CardDto[]> {
    return await this.cardRepository.findAll(instance);
  }

  public async isCardExistingInInstance(
    instance: InstanceEntity,
    card: CardDto,
  ): Promise<boolean> {
    const destinationCards = await this.findAll(instance);
    //TODO : Check that template tags are the same (QUestion parameters)
    for (const destinationCard of destinationCards) {
      if (
        destinationCard.dataset_query.type === 'native' &&
        card['type'] === 'native'
      ) {
        if (
          destinationCard.dataset_query.native.query === card['native'].query
        ) {
          return true;
        }
      }
    }
    return false;
  }

  public async updateDatasetQuery(
    originInstance: InstanceEntity,
    destinationInstance: InstanceEntity,
    dataSetQuery: DataSetQuery,
  ): Promise<DataSetQuery> {
    if (dataSetQuery?.type === 'native') {
      const templateTagsKeys = Object.keys(
        dataSetQuery.native['template-tags'],
      );

      for (const templateTagKey of templateTagsKeys) {
        if (
          dataSetQuery.native['template-tags'][templateTagKey]?.type ===
          'dimension'
        ) {
          if (
            dataSetQuery.native['template-tags'][templateTagKey]
              ?.dimension[0] === 'field'
          ) {
            dataSetQuery.native['template-tags'][templateTagKey].dimension[1] =
              await this.fieldService.findOriginFieldIdInDestination(
                originInstance,
                destinationInstance,
                dataSetQuery.native['template-tags'][templateTagKey]
                  ?.dimension[1],
              );
          }
        }
      }
    }

    if (dataSetQuery.type === 'query') {
      if (typeof dataSetQuery?.query?.aggregation != 'undefined') {
        if (dataSetQuery?.query?.aggregation?.length > 0) {
          for (const aggregation of dataSetQuery.query.aggregation) {
            switch (aggregation[0]) {
              case 'sum':
              case 'aggregation-options':
              case 'distinct':
                if (aggregation[1][0] === 'field') {
                  const originalFieldId = aggregation[1][1];

                  aggregation[1][1] =
                    await this.fieldService.findOriginFieldIdInDestination(
                      originInstance,
                      destinationInstance,
                      originalFieldId,
                    );
                }
                break;

              case 'count':
                break;

              default:
                break;
            }
          }
        }
      }
      if (typeof dataSetQuery?.query?.breakout != 'undefined') {
        if (dataSetQuery?.query?.breakout?.length > 0) {
          for (const breakout of dataSetQuery.query.breakout) {
            if (breakout[0] === 'field') {
              const originalFieldId = breakout[1];
              breakout[1] =
                await this.fieldService.findOriginFieldIdInDestination(
                  originInstance,
                  destinationInstance,
                  originalFieldId,
                );
            }
          }
        }
      }

      if (typeof dataSetQuery?.query?.joins != 'undefined') {
        if (dataSetQuery?.query?.joins?.length > 0) {
          for (const join of dataSetQuery.query.joins) {
            if (join['condition'][0] === '=') {
              if (join['condition'][1][0] === 'field')
                join['condition'][1][1] =
                  await this.fieldService.findOriginFieldIdInDestination(
                    originInstance,
                    destinationInstance,
                    join['condition'][1][1],
                  );
            }
            const joinSourceTable =
              await this.tableService.getOriginTableInDestination(
                originInstance,
                destinationInstance,
                join['source-table'],
              );
            join['source-table'] = joinSourceTable.id;
          }
        }
      }
      const destinationSourceTable =
        await this.tableService.getOriginTableInDestination(
          originInstance,
          destinationInstance,
          dataSetQuery.query['source-table'],
        );

      dataSetQuery.query['source-table'] = destinationSourceTable.id;
    }

    return dataSetQuery;
  }

  public processCardDescription(description: string | null): string | null {
    if (description) {
      if (description.length > 0) {
        return description;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
}
