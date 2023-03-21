import { Component, OnInit } from '@angular/core';
import { MetabaseInstanceDto } from '../../../feature/metabase-instance/dto/metabase-instance.dto';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MetabaseInstanceService } from '../../../feature/metabase-instance/services/metabase-instance.service';
import { MetabaseInstanceRepository } from '../../../feature/metabase-instance/repositories/metabase-instance.repository';

@Component({
  selector: 'app-connection-prompt',
  templateUrl: './connection-prompt.component.html',
  styleUrls: ['./connection-prompt.component.scss'],
})
export class ConnectionPromptComponent implements OnInit {
  public instance!: MetabaseInstanceDto;
  public instanceConnectForm!: FormGroup;
  public isLoaded!: boolean;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,

    private instanceService: MetabaseInstanceService,
    private instanceRepository: MetabaseInstanceRepository
  ) {}

  public ngOnInit() {
    this.instance = this.config.data.instance;

    this.instanceConnectForm = new FormGroup<any>({
      password: new FormControl(null, Validators.required),
    });

    this.isLoaded = true;
  }

  public async onFormSubmit() {
    this.isLoaded = false;
    this.instance.password = this.instanceConnectForm
      .get('password')
      ?.getRawValue();

    this.instance = await this.instanceRepository.connect(this.instance);
    this.isLoaded = true;
    this.ref.close(this.instance);
  }
}
