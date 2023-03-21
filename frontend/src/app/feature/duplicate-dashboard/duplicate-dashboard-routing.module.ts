import { RouterModule, Routes } from '@angular/router';
import { CopyDashboardAcrossInstanceComponent } from './components/copy-dashboard-across-instance/copy-dashboard-across-instance.component';
import { NgModule } from '@angular/core';
import { AuthGuard } from '../../core/guards/auth.guard';
import { InstanceResolver } from '../metabase-instance/services/instance.resolver';

const routes: Routes = [
  {
    path: '',
    component: CopyDashboardAcrossInstanceComponent,
    resolve: [InstanceResolver],
    canActivate: [AuthGuard],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DuplicateDashboardRoutingModule {}
