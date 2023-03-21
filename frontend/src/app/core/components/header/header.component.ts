import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../feature/auth/services/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../../../feature/auth/user.model';
import { UserService } from '../../../feature/user/services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  public userMenuItems!: MenuItem[];
  public profileMenuItems!: MenuItem[];
  public isAuthenticated: boolean = false;
  private userSub!: Subscription;
  public user!: User;
  public publicMenuItems!: MenuItem[];

  constructor(
    private auth: AuthService,
    private router: Router,
    private userRepository: UserService
  ) {}
  public ngOnInit() {
    this.userSub = this.userRepository.user.subscribe((user) => {
      console.log(`Authenticated : ${!!user}`);
      this.isAuthenticated = !!user;
      this.user = user;
      if (user) {
        this.profileMenuItems = [
          {
            label: user.name,
            icon: 'pi pi-user',
            items: [
              {
                label: 'Sign Out',
                icon: 'pi pi-sign-out',
                command: () => {
                  this.onSignOut();
                },
              },
            ],
          },
        ];
        this.userMenuItems = [
          {
            label: 'My instances',
            routerLink: ['/instance'],
            visible: !!user,
          },
          {
            label: 'Tools',
            items: [
              {
                label: 'Duplicate dashboard across instances',
                routerLink: ['/duplicate-dashboard'],
              },
              {
                label: 'Duplicate card across instances',
                routerLink: ['/duplicate-card'],
              },
            ],
          },
          {
            label: user.name,
            icon: 'pi pi-user',
            items: [
              {
                label: 'Settings',
                icon: 'pi pi-cog',
                routerLink: ['user/settings'],
              },
              {
                label: 'Profile',
                icon: 'pi pi-user',
                routerLink: ['user/profile'],
              },
              {
                label: 'Sign Out',
                icon: 'pi pi-sign-out',
                command: () => {
                  this.onSignOut();
                },
              },
            ],
          },
        ];
      }
    });
  }

  public onSignOut() {
    this.auth.logout();
  }

  public onSignIn() {
    this.router.navigateByUrl('/login');
  }

  public ngOnDestroy() {
    this.userSub.unsubscribe();
  }
}
