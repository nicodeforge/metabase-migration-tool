import { Component, OnInit } from '@angular/core';
import { User } from '../../auth/user.model';
import { DialogService } from 'primeng/dynamicdialog';
import { EditComponent } from '../edit/edit.component';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  public user!: User;
  constructor(
    private userService: UserService,
    private dialog: DialogService
  ) {}

  ngOnInit() {
    this.userService.user.subscribe((user) => {
      this.user = user;
    });
  }

  onEditUser() {
    const ref = this.dialog.open(EditComponent, {
      data: {
        user: this.user,
      },
      header: 'Edit your profile',
      height: '80%',
    });

    ref.onClose.subscribe((user) => {
      this.userService.updateRemotelly(user);
    });
  }
}
