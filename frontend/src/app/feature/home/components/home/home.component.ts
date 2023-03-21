import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from '../../../auth/services/local-storage.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private refreshSub!: Subscription;
  constructor(
    private readonly router: Router,
    private storage: LocalStorageService,
    private auth: AuthService
  ) {}

  public ngOnInit() {
    /*    const originalItem = {
      var1: 'coucou',
      var2: '2',
      var3: '3',
    };
    const key = 'test';

    this.storage.setItem(key, originalItem);

    const updatedItem = {
      //var1: '1',
      var2: '5',
      var3: '6',
    };

    this.storage.updateItem(key, updatedItem);*/
  }
  public onDuplicateDashboardClick() {
    this.router.navigateByUrl('/duplicate-dashboard');
  }

  onInstanceClick() {
    this.router.navigateByUrl('/instance');
  }

  testRefresh() {
    this.refreshSub = this.auth
      .refreshUserToken()
      .subscribe((response: any) => {
        const updatedTokens = {
          _accessToken: response.accessToken,
          _refreshToken: response.refreshToken,
        };
        this.storage.updateItem('userData', updatedTokens);
        console.log(response);
      });
  }

  ngOnDestroy() {
    this.refreshSub?.unsubscribe();
  }
}
