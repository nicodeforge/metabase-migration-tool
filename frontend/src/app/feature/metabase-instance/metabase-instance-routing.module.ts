import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { InstanceCreateComponent } from './components/instance-create/instance-create.component';
import { InstanceListComponent } from './components/instance-list/instance-list.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { InstanceResolver } from './services/instance.resolver';

const routes: Routes = [
  {
    path: 'create',
    component: InstanceCreateComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'edit/:id',
    component: InstanceCreateComponent,
    resolve: [InstanceResolver],
  },
  {
    path: '',
    pathMatch: 'full',
    component: InstanceListComponent,
    resolve: [InstanceResolver],
    canActivate: [AuthGuard],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MetabaseInstanceRoutingModule {}
