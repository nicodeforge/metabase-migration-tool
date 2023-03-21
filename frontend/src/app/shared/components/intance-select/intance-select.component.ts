import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MetabaseInstanceDto } from '../../../feature/metabase-instance/dto/metabase-instance.dto';
import { MetabaseInstanceService } from '../../../feature/metabase-instance/services/metabase-instance.service';
import { FormControl, FormGroup } from '@angular/forms';
import { ConnectionPromptComponent } from '../connection-prompt/connection-prompt.component';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';

export interface InstanceSelect {
  id: string;
  name: string;
  inactive: boolean;
}

export interface SelectedInstances {
  origin: MetabaseInstanceDto;
  destination: MetabaseInstanceDto;
}

@Component({
  selector: 'app-intance-select',
  templateUrl: './intance-select.component.html',
  styleUrls: ['./intance-select.component.scss'],
})
export class IntanceSelectComponent implements OnInit {
  public instanceList!: MetabaseInstanceDto[];
  public instances!: InstanceSelect[];
  public instanceForm!: FormGroup;
  public originInstance!: MetabaseInstanceDto;
  public destinationInstance!: MetabaseInstanceDto;

  @Input() resetForm!: Subject<boolean>;
  @Output() instancesSelected = new EventEmitter<SelectedInstances>();
  constructor(
    private instanceService: MetabaseInstanceService,
    private dialogService: DialogService
  ) {}
  public ngOnInit() {
    this.resetForm.subscribe((reset) => {
      if (reset) {
        this.instanceForm.reset();
        this.instances.forEach((instance) => (instance.inactive = false));
      }
    });
    this.instanceList = this.instanceService.getInstances();
    this.instances = this.instanceList.map((instance) => {
      return {
        id: instance.id,
        name: instance.name,
        inactive: false,
      };
    });

    this.instanceList.forEach((instance) => {
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
    });

    this.instanceForm = new FormGroup<any>({
      originInstance: new FormControl(null),
      destinationInstance: new FormControl(null),
    });
  }

  public onSelectOriginInstance() {
    const originInstanceId = this.instanceForm
      .get('originInstance')
      ?.getRawValue();

    const instanceSelected = this.instanceList.find(
      (instance) => instance.id === originInstanceId
    );

    if (instanceSelected) {
      this.originInstance = instanceSelected;

      this.instanceForm.setValue({
        originInstance: originInstanceId,
        destinationInstance: null,
      });

      this.instances.forEach((instance) => {
        instance.inactive = instance.id === instanceSelected.id;
      });

      this.onInstancesSelected();
    }
  }

  public onSelectDestinationInstance() {
    const instanceId = this.instanceForm
      .get('destinationInstance')
      ?.getRawValue();
    const instanceSelected = this.instanceList.find(
      (instance) => instance.id === instanceId
    );
    if (instanceSelected) {
      this.destinationInstance = instanceSelected;
      this.onInstancesSelected();
    }
  }

  private onInstancesSelected(): void {
    if (this.originInstance && this.destinationInstance) {
      this.instancesSelected.emit({
        origin: this.originInstance,
        destination: this.destinationInstance,
      });
    }
  }
}
