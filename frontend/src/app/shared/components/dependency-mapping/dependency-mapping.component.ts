import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  MetabaseModelTypeEnum,
  ModelWithDependenciesDto,
} from '../../../feature/duplicate-dashboard/dto/model-with-dependencies.dto';
import { MetabaseInstanceDto } from '../../../feature/metabase-instance/dto/metabase-instance.dto';
import { ModelCreationEnum } from '../../../feature/duplicate-dashboard/models/model-creation.enum';
import { ApiCardDto } from '../../../feature/duplicate-dashboard/api-dto/api-card.dto';
import { ApiDashboardDto } from '../../../feature/duplicate-dashboard/api-dto/api-dashboard.dto';
import { ModelService } from '../../services/model.service';
import { ModelDependencyRequest } from './model-dependency.request';
import { DatabaseCheckSchemaRequest } from '../../../feature/duplicate-dashboard/components/copy-dashboard-across-instance/database-check-schema.request';
import { TableListComponent } from '../../../feature/duplicate-dashboard/components/table-list/table-list.component';
import { DatabaseSchemaEqualityInterface } from '../../../feature/duplicate-dashboard/repositories/database-schema-equality.interface';
import { DialogService } from 'primeng/dynamicdialog';
import { ModalComponent } from '../modal/modal.component';
import { HttpErrorResponse } from '@angular/common/http';
import { CreateModelDto } from '../../repositories/create-model.dto';

@Component({
  selector: 'app-dependency-mapping',
  templateUrl: './dependency-mapping.component.html',
  styleUrls: ['./dependency-mapping.component.scss'],
})
export class DependencyMappingComponent implements OnInit {
  @Input() modelType!: MetabaseModelTypeEnum;
  @Input() originModel!: ApiCardDto | ApiDashboardDto;
  @Input() originInstance!: MetabaseInstanceDto;
  @Input() destinationInstance!: MetabaseInstanceDto;
  @Output() modelToCreate: EventEmitter<CreateModelDto> =
    new EventEmitter<CreateModelDto>();
  @Output() step: EventEmitter<number> = new EventEmitter<number>();
  public model!: ModelWithDependenciesDto;

  public isLoaded: boolean = false;
  public hasError: boolean = false;

  public createOrUpdate: ModelCreationEnum[] = [
    ModelCreationEnum.create,
    ModelCreationEnum.update,
  ];

  public step2SubmitLabel = 'Proceed';

  public entitiesMapped = false;

  constructor(
    private readonly modelService: ModelService,
    public dialogService: DialogService
  ) {}

  public ngOnInit(): void {
    this.getModelDependencies();
  }

  public async onSelectDatabase(
    originDatabaseId: number,
    destinationDatabaseId: number
  ): Promise<void> {
    const databaseSchemaCheckRequest: DatabaseCheckSchemaRequest = {
      originInstanceId: this.originInstance.id,
      originDatabaseId: originDatabaseId,
      destinationInstanceId: this.destinationInstance.id,
      destinationDatabaseId: destinationDatabaseId,
    };
    const databasesAreTheSame: DatabaseSchemaEqualityInterface =
      await this.modelService.getDatabasesSchemasAreSame(
        databaseSchemaCheckRequest
      );

    const database = this.model.dependencies.databases.find(
      (db) => db.origin.id === originDatabaseId
    );

    if (!databasesAreTheSame['status']) {
      const ref = this.dialogService.open(TableListComponent, {
        header: 'Database schema mismatch',
        data: {
          tables: databasesAreTheSame['result'],
        },
      });

      ref.onClose.subscribe((confirm: boolean) => {
        if (confirm && typeof database != 'undefined') {
          database.isMapped = true;
          this.checkEntitiesMapping();
        }
      });
    } else {
      if (typeof database != 'undefined') {
        database.isMapped = true;
        this.checkEntitiesMapping();
      }
    }

    this.checkEntitiesMapping();
  }

  public onCreateCollectionSwitch(collectionId: number): void {
    const collection = this.model.dependencies.collections.find(
      (collection) => collection.origin.id === collectionId
    );

    if (typeof collection != 'undefined') {
      if (!collection.existsInDestination && !collection.createInDestination) {
        collection.isMapped = false;
      }

      if (collection.createInDestination) {
        collection.isMapped = true;
      }
      if (collection.existsInDestination) {
        collection.isMapped = true;
      }
    }

    this.checkEntitiesMapping();
  }

  public onSelectUser(originUserId: number): void {
    const user = this.model.dependencies.users.find(
      (user) => user.origin.id === originUserId
    );

    if (typeof user != 'undefined' && user.destination.id) {
      setTimeout(() => {
        user.isMapped = true;
        this.checkEntitiesMapping();
      }, 0);
      console.log('mapped user with origin id ' + user.origin.id);
    }

    if (typeof user != 'undefined' && user.destination.id === null) {
      setTimeout(() => {
        user.isMapped = false;
        this.checkEntitiesMapping();
      }, 0);
      console.log('Empty user');
    }

    console.log(`Destination user mapped : ${user?.destination.id}`);
  }

  public oncreateOrUpdateModel(): void {
    this.checkEntitiesMapping();
  }

  public onPreviousStep(): void {}

  private getModelDependencies(): void {
    console.log('getModelDependencies');
    const modelDependencyRequest: ModelDependencyRequest = {
      originInstanceId: this.originInstance.id,
      destinationInstanceId: this.destinationInstance.id,
      modelType: this.modelType,
      modelId: this.originModel.id,
    };

    this.modelService
      .getModelWithDependencies(modelDependencyRequest)
      .subscribe({
        next: (model) => {
          this.model = model;
          console.log(this.model);
        },
        error: (error: any) => {
          console.log('ERROR CATCHED IN SUBSCRIPTION', error);
          this.handleError('fetching dashboard information', error);
        },
        complete: () => {
          this.isLoaded = true;
          console.info('Completed');
        },
      });
  }

  private checkEntitiesMapping(): void {
    const allDatabasesAreMapped: boolean =
      this.model.dependencies.databases.filter((db) => !db.isMapped).length ===
      0;

    console.log('All databases are mapped : ' + allDatabasesAreMapped);

    const allCollectionsAreMapped =
      this.model.dependencies.collections.filter(
        (collection) => !collection.isMapped && !collection.existsInDestination
      ).length === 0;

    console.log('All collections are mapped : ' + allCollectionsAreMapped);

    const allUsersAreMapped =
      this.model.dependencies.users.filter(
        (user) => !user.isMapped && !user.existsInDestination
      ).length === 0;

    console.log(
      'All users are mapped : ' + allUsersAreMapped,
      this.model.dependencies.users.filter(
        (user) => !user.isMapped && !user.existsInDestination
      )
    );

    let createOrUpdateDashboardSelected: any;

    if (this.model.existsInDestination) {
      createOrUpdateDashboardSelected = this.model.origin.createOrUpdate;
    } else {
      createOrUpdateDashboardSelected = true;
    }

    console.log(createOrUpdateDashboardSelected);

    if (
      allDatabasesAreMapped &&
      allCollectionsAreMapped &&
      allUsersAreMapped &&
      typeof createOrUpdateDashboardSelected != 'undefined'
    ) {
      this.entitiesMapped = true;
      this.step2SubmitLabel = 'Next';
    }
  }

  public onSubmitStep2(): void {
    this.modelToCreate.emit(
      this.modelService.getModelToCreate(this.model, this.modelType)
    );
  }
  private handleError(context: string, errorResponse: HttpErrorResponse) {
    console.log('Error Response', errorResponse);
    let errorMessage: string;
    if (!errorResponse.error || !errorResponse.error) {
      errorMessage = `An error occured while ${context}`;
    } else {
      errorMessage = `While ${context}, the following error occured : ${errorResponse.error.message}`;
    }

    const ref = this.dialogService.open(ModalComponent, {
      header: 'An error occured',
      data: errorMessage,
    });

    ref.onClose.subscribe(() => {
      this.isLoaded = true;
      this.hasError = true;
    });
  }
}
