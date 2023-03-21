import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { User } from '../../auth/user.model';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit {
  public userForm!: FormGroup;

  private user!: User;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {}

  ngOnInit() {
    this.user = this.config.data.user;

    this.userForm = new FormGroup<any>({
      id: new FormControl(this.user.id, Validators.required),
      name: new FormControl(this.user.name, Validators.required),
      email: new FormControl(this.user.email, Validators.required),
    });
  }

  onFormSubmit() {
    this.user.email = this.userForm.get('email')?.getRawValue();
    this.user.name = this.userForm.get('name')?.getRawValue();

    this.ref.close(this.user);
  }
}
