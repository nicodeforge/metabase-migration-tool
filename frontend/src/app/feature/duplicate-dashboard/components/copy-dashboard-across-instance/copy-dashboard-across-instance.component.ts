import { Component, OnChanges, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DuplicateDashboardService } from '../../services/duplicate-dashboard.service';
import { MenuItem } from 'primeng/api';
import { ApiDashboardWithDependenciesDto } from '../../api-dto/api-dashboard-with-dependencies.dto';
import { ApiModelDependencyDto } from '../../api-dto/api-model-dependency.dto';
import { CreateApiDashboardDto } from '../../api-dto/create-api-dashboard.dto';
import { ApiDashboardDto } from '../../api-dto/api-dashboard.dto';
import { DialogService } from 'primeng/dynamicdialog';
import { TableListComponent } from '../table-list/table-list.component';
import { MetabaseInstanceDto } from '../../../metabase-instance/dto/metabase-instance.dto';
import { MetabaseInstanceService } from '../../../metabase-instance/services/metabase-instance.service';
import { Subscription } from 'rxjs';
import { ConnectionPromptComponent } from '../../../../shared/components/connection-prompt/connection-prompt.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { DashboardDependencyRequest } from '../../repositories/dashboard-dependency.request';
import { SaveDashboardRequest } from '../../repositories/save-dashboard.request';
import { DatabaseCheckSchemaRequest } from './database-check-schema.request';

interface instanceSelect {
  id: string;
  name: string;
  inactive: boolean;
}

@Component({
  selector: 'app-copy-dashboard-across-instance',
  templateUrl: './copy-dashboard-across-instance.component.html',
  styleUrls: ['./copy-dashboard-across-instance.component.scss'],
})
export class CopyDashboardAcrossInstanceComponent implements OnInit, OnChanges {
  public instances: instanceSelect[] = [];

  private instanceList!: MetabaseInstanceDto[];
  public originForm!: FormGroup;

  public dashboardWithDependencies!: ApiDashboardWithDependenciesDto;

  public step: number = 1;

  public steps!: MenuItem[];

  public dependencies!: ApiModelDependencyDto;

  public originDashboards: ApiDashboardDto[] = [];

  public selectionLimit: number = 1;

  public newDashboard!: CreateApiDashboardDto;

  public originInstance: MetabaseInstanceDto = new MetabaseInstanceDto();

  public destinationInstance: MetabaseInstanceDto = new MetabaseInstanceDto();

  public isDashboardSelected: boolean = false;

  public isLoaded: boolean = false;

  public newDashboardUrl!: string;

  public test!: any;

  public entitiesMapped: boolean = false;

  public updateOrCreate: any = ['update', 'create'];

  public step2SubmitLabel: string = 'Pending mapping';

  private instancesUpdated!: Subscription;
  public hasError: boolean = false;

  constructor(
    private readonly dashboardService: DuplicateDashboardService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    public dialogService: DialogService,

    private instanceService: MetabaseInstanceService
  ) {}

  public ngOnInit(): void {
    this.instanceList = this.instanceService.getInstances();
    this.instancesUpdated = this.instanceService.instancesChanged.subscribe(
      (instances: MetabaseInstanceDto[]) => {
        this.instanceList = instances;
      }
    );

    this.instanceList.forEach((instance) => {
      this.instances.push({
        id: instance.id,
        name: instance.name,
        inactive: false,
      });

      if (!instance.token) {
        let instanceConnectionPrompt = this.dialogService.open(
          ConnectionPromptComponent,
          {
            header: `Connect to instance ${instance?.name} at ${instance?.url} before proceeding`,
            data: {
              instance: instance,
            },
          }
        );

        instanceConnectionPrompt.onClose.subscribe((instance) => {
          this.instanceService.updateInstance(instance);
        });
      }

      console.log(`Pushed instance ${instance.name}`);
    });

    this.originForm = new FormGroup<any>({
      originInstance: new FormControl(null),
      destinationInstance: new FormControl(null),
      originDashboard: new FormControl({
        value: null,
        disabled: false,
      }),
    });
    this.steps = [
      { label: 'Choose a dashboard' },
      { label: 'Map dependencies' },
      { label: 'Confirm' },
      { label: 'Finished' },
    ];

    this.isLoaded = true;
  }

  public async onSelectOriginInstance() {
    const originInstanceId = this.originForm
      .get('originInstance')
      ?.getRawValue();
    const instanceSelected = this.instanceList.find(
      (instance) => instance.id === originInstanceId
    );
    if (instanceSelected) {
      this.originInstance = instanceSelected;
    }

    this.originDashboards = await this.dashboardService.getAllDashboards(
      this.originInstance.id
    );

    this.originForm.setValue({
      originInstance: this.originInstance.id,
      destinationInstance: null,
      //dashboardId: null,
      originDashboard: null,
    });

    this.instances.forEach((instance) => (instance.inactive = false));

    const disabledInstance = this.instances.find(
      (instance) => instance.id === this.originInstance.id
    );
    if (disabledInstance) {
      disabledInstance.inactive = true;
    }

    console.log(`Origin instance: ${JSON.stringify(this.originInstance)}`);
  }

  onSelectDestinationInstance() {
    const destinationInstance = this.instanceList.find(
      (instance) =>
        instance.id ===
        this.originForm.get('destinationInstance')?.getRawValue()
    );

    if (destinationInstance) {
      this.destinationInstance = {
        ...this.destinationInstance,
        id: destinationInstance.id,
        name: destinationInstance.name,
      };
    } else {
      alert('There was a problem determining your destination instance');
    }
    console.log(`Destination instance: ${this.destinationInstance}`);
  }

  public async onOriginFormSubmit() {
    this.isLoaded = false;
    console.log(this.originForm.getRawValue());

    const dashboardDependencyRequest: DashboardDependencyRequest = {
      originInstanceId: this.originForm.get('originInstance')?.getRawValue(),
      destinationInstanceId: this.originForm
        .get('destinationInstance')
        ?.getRawValue(),
      dashboardId: this.originForm.get('originDashboard')?.getRawValue()[0],
    };
    this.dashboardService
      .getDashboardDependency(dashboardDependencyRequest)
      .subscribe({
        next: (dashboard) => {
          this.dashboardWithDependencies = dashboard;
          console.log(this.dashboardWithDependencies);
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
    this.step = 2;
  }

  onSubmitStep2() {
    this.step = 3;
    this.newDashboard = this.dashboardService.getDashboardToCreate(
      this.dashboardWithDependencies
    );

    console.log('Dashboard to create', this.newDashboard);
  }

  public async onSubmitStep3() {
    this.isLoaded = false;
    this.step = 4;
    console.log(this.newDashboard);
    const saveDashboardRequest: SaveDashboardRequest = {
      originInstanceId: this.originInstance.id,
      destinationInstanceId: this.destinationInstance.id,
      dashboard: this.newDashboard,
    };
    const response = await this.dashboardService.saveDashboard(
      saveDashboardRequest
    );

    if (response.status === 'ok') {
      this.isLoaded = true;
      this.newDashboardUrl = response.url;
    } else {
      this.isLoaded = true;
    }
    console.log(this.newDashboardUrl);
  }

  onSelectDashboard() {
    this.isDashboardSelected = true;
    console.log(
      `OriginSelected : ${this.originInstance}, DestinationSelected: ${this.destinationInstance}, dashboardSelected : ${this.isDashboardSelected}`
    );
  }

  onNavigateToDashboard(): void {
    (window as any).open(this.newDashboardUrl, '_blank');
  }

  public async onSelectDatabase(
    originDatabaseId: number,
    destinationDatabaseId: number
  ) {
    console.log('Checking database schemas equality');
    const databaseSchemaCheckRequest: DatabaseCheckSchemaRequest = {
      originInstanceId: this.originInstance.id,
      originDatabaseId: originDatabaseId,
      destinationInstanceId: this.destinationInstance.id,
      destinationDatabaseId: destinationDatabaseId,
    };
    const databasesAreTheSame: Record<any, any> =
      await this.dashboardService.getDatabasesSchemasAreSame(
        databaseSchemaCheckRequest
      );

    const database = this.dashboardWithDependencies.dependencies.databases.find(
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

        // this.checkEntitiesMapping();
      });
    } else {
      if (typeof database != 'undefined') {
        database.isMapped = true;
        this.checkEntitiesMapping();
      }
    }

    this.checkEntitiesMapping();
  }

  onSelectUser(id: number, destinationId: number) {
    console.log(id, destinationId);
    const user = this.dashboardWithDependencies.dependencies.users.find(
      (user) => user.origin.id === id
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

  public checkEntitiesMapping() {
    const allDatabasesAreMapped: boolean =
      this.dashboardWithDependencies.dependencies.databases.filter(
        (db) => !db.isMapped
      ).length === 0;

    console.log('All databases are mapped : ' + allDatabasesAreMapped);

    const allCollectionsAreMapped =
      this.dashboardWithDependencies.dependencies.collections.filter(
        (collection) => !collection.isMapped && !collection.existsInDestination
      ).length === 0;

    console.log('All collections are mapped : ' + allCollectionsAreMapped);

    const allUsersAreMapped =
      this.dashboardWithDependencies.dependencies.users.filter(
        (user) => !user.isMapped && !user.existsInDestination
      ).length === 0;

    console.log(
      'All users are mapped : ' + allUsersAreMapped,
      this.dashboardWithDependencies.dependencies.users.filter(
        (user) => !user.isMapped && !user.existsInDestination
      )
    );

    let createOrUpdateDashboardSelected: any;

    if (this.dashboardWithDependencies.existsInDestination) {
      createOrUpdateDashboardSelected =
        this.dashboardWithDependencies.dashboard.createOrUpdate;
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

  onCreateCollectionSwitch(id: number): void {
    const collection =
      this.dashboardWithDependencies.dependencies.collections.find(
        (collection) => collection.origin.id === id
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

  public onPreviousStep() {
    this.step--;
  }

  onSelectStep(event: any) {
    const targetStep = event.target?.innerHTML;
    if (targetStep < this.step) {
      this.step = targetStep;
    }
  }

  public onUpdateOrCreateDashboard(): void {
    console.log(
      'Dashboard createOrUpdate : ',
      this.dashboardWithDependencies.dashboard.createOrUpdate
    );

    this.checkEntitiesMapping();
  }

  public onRestart() {
    this.originForm.reset();
    this.instances.forEach((instance) => (instance.inactive = false));
    this.step = 1;
  }

  ngOnChanges() {
    console.log('CHANGE DETECTED');
  }

  private handleError(context: string, errorResponse: any): void {
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
      this.step--;
      this.hasError = true;
    });
  }
}
