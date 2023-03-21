import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { User } from '../../../feature/auth/user.model';
import { AuthService } from '../../../feature/auth/services/auth.service';
import { UserService } from '../../../feature/user/services/user.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  public userMenuItems!: MenuItem[];
  private userSub!: Subscription;
  private user!: User;
  public isAuthenticated: boolean = false;
  constructor(private auth: AuthService, private userRepository: UserService) {}

  ngOnInit() {
    this.userSub = this.userRepository.user.subscribe((user) => {
      console.log(`Authenticated : ${!!user}`);
      this.isAuthenticated = !!user;
      this.user = user;
      if (user) {
        this.userMenuItems = [
          {
            label: 'My instances',
            routerLink: ['/instance'],
            visible: !!user,
            items: [
              {
                label: 'List',
                routerLink: ['/instance'],
              },
            ],
          },
          {
            label: 'Tools',
            items: [
              {
                label: 'Duplicate dashboard across instances',
                routerLink: ['/duplicate-dashboard'],
              },
            ],
          },
        ];
      }
    });
  }
}
