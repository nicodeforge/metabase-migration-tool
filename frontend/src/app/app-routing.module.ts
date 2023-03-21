import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './feature/landing-page/components/landing-page.component';
import { HomeComponent } from './feature/home/components/home/home.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'duplicate-dashboard',
    loadChildren: () =>
      import('./feature/duplicate-dashboard/duplicate-dashboard.module').then(
        (m) => m.DuplicateDashboardModule
      ),
  },
  {
    path: 'duplicate-card',
    loadChildren: () =>
      import('./feature/duplicate-card/duplicate-card.module').then(
        (m) => m.DuplicateCardModule
      ),
  },
  {
    path: 'instance',
    loadChildren: () =>
      import('./feature/metabase-instance/metabase-instance.module').then(
        (m) => m.MetabaseInstanceModule
      ),
  },
  {
    path: 'user',
    loadChildren: () =>
      import('./feature/user/user.module').then((m) => m.UserModule),
  },

  {
    path: 'app',
    component: HomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '',
    component: LandingPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
