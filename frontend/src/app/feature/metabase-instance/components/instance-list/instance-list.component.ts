import { Component, OnDestroy, OnInit } from '@angular/core';
import { MetabaseInstanceDto } from '../../dto/metabase-instance.dto';
import { MetabaseInstanceService } from '../../services/metabase-instance.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { ConnectionPromptComponent } from '../../../../shared/components/connection-prompt/connection-prompt.component';
import { Subscription } from 'rxjs';
import { MetabaseInstanceRepository } from '../../repositories/metabase-instance.repository';

@Component({
  selector: 'app-instance-list',
  templateUrl: './instance-list.component.html',
  styleUrls: ['./instance-list.component.scss'],
})
export class InstanceListComponent implements OnInit, OnDestroy {
  public instances!: MetabaseInstanceDto[];
  public isLoaded: boolean = false;
  public hasInstances: boolean = false;
  private refSub!: Subscription;

  private instancesUpdated!: Subscription;
  constructor(
    private readonly instanceService: MetabaseInstanceService,

    private readonly instanceRepository: MetabaseInstanceRepository,
    private readonly router: Router,
    private route: ActivatedRoute,
    public dialogService: DialogService
  ) {}
  public async ngOnInit(): Promise<void> {
    console.log('Waiting for instances');
    this.instances = this.instanceService.getInstances();
    this.instancesUpdated = this.instanceService.instancesChanged.subscribe(
      (instances: MetabaseInstanceDto[]) => {
        this.instances = instances;
      }
    );
    this.hasInstances = this.instances?.length > 0;
    this.isLoaded = true;
  }

  public onCreateInstance() {
    this.router.navigateByUrl('/instance/create');
  }

  onConnectInstance(instanceId: string) {
    const instance = this.instances.find(
      (instance) => instance.id === instanceId
    );
    const ref = this.dialogService.open(ConnectionPromptComponent, {
      header: `Connect to instance ${instance?.name} at ${instance?.url}`,
      data: {
        instance: instance,
      },
    });

    this.refSub = ref.onClose.subscribe((instance: MetabaseInstanceDto) => {
      if (instance) {
        this.instanceService.updateInstance(instance);
        /*for (let initialInstance of this.instances) {
          if (initialInstance.id === instance.id) {
            initialInstance = instance;
          }
        }*/
      }
    });
  }

  public async onDeleteInstance(instanceId: string) {
    const instance = this.instances.find(
      (instance) => instance.id === instanceId
    );

    if (typeof instance != 'undefined') {
      const deleteResult = await this.instanceRepository.delete(instance);
      console.log(JSON.stringify(deleteResult));

      this.instances = this.instances.filter((inst) => inst.id != instanceId);
    } else {
      console.log('Could not find instance');
    }
  }

  onUpdateInstance(instanceId: string) {
    this.router.navigate(['edit', instanceId], {
      relativeTo: this.route,
    });
    console.log(`Updating ${instanceId}`);
  }

  public ngOnDestroy(): void {
    if (this.refSub) {
      this.refSub.unsubscribe();
    }
  }

  public async onRefreshList() {
    //await this.instanceService.getInstances(InstanceRetrievalMethodEnum.remote);
  }
}
