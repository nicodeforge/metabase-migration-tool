import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MetabaseInstanceService } from '../../services/metabase-instance.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MetabaseInstanceDto } from '../../dto/metabase-instance.dto';
import { MetabaseInstanceRepository } from '../../repositories/metabase-instance.repository';
import { CreateInstanceDto } from '../../dto/create-instance.dto';

@Component({
  selector: 'app-instance-create',
  templateUrl: './instance-create.component.html',
  styleUrls: ['./instance-create.component.scss'],
})
export class InstanceCreateComponent implements OnInit {
  public instanceForm!: FormGroup;

  public instanceId!: string;
  public isEditMode: boolean = false;

  constructor(
    private instanceService: MetabaseInstanceService,
    private instanceRepository: MetabaseInstanceRepository,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  public ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.instanceId = params['id'];
      this.isEditMode = params['id'] != null;

      this.initForm();
    });
  }

  private initForm() {
    let instanceName: string = '',
      instanceUsername: string = '',
      instanceUrl: string = '',
      instanceId: string = '';

    //TODO : Fix instance editing

    if (this.isEditMode) {
      const instance = this.instanceService.getInstance(this.instanceId);
      console.log('EDIT', instance);
      instanceId = instance.id;
      instanceName = instance.name;
      instanceUsername = instance.username;
      instanceUrl = instance.url;
    }

    this.instanceForm = new FormGroup<any>({
      id: new FormControl(instanceId),
      name: new FormControl(instanceName, Validators.required),
      username: new FormControl(instanceUsername, Validators.required),
      url: new FormControl(instanceUrl, Validators.required),
    });
  }

  public async onFormSubmit() {
    console.log(this.instanceForm.getRawValue());
    let instanceUpdate!: MetabaseInstanceDto;
    if (!this.isEditMode) {
      let form = this.instanceForm.getRawValue();
      const instanceCreate: CreateInstanceDto = new CreateInstanceDto();
      instanceCreate.name = form.name;
      instanceCreate.url = form.url;
      instanceCreate.username = form.username;

      instanceUpdate = await this.instanceRepository.save(instanceCreate);
      this.instanceService.addInstance(instanceUpdate);
    } else {
      instanceUpdate = await this.instanceRepository.update(
        this.instanceForm.getRawValue()
      );
      this.instanceService.updateInstance(this.instanceForm.getRawValue());
    }

    if (instanceUpdate) {
      await this.router.navigateByUrl('/instance');
    }
  }
}
