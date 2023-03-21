import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DuplicateCardAcrossInstanceComponent } from './components/duplicate-card-across-instance/duplicate-card-across-instance.component';
import { InstanceResolver } from '../metabase-instance/services/instance.resolver';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: DuplicateCardAcrossInstanceComponent,
    resolve: [InstanceResolver],
    canActivate: [AuthGuard],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DuplicateCardRoutingModule {}
