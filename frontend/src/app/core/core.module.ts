import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { httpInterceptorProviders } from './interceptors';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SidebarModule } from 'primeng/sidebar';
import { PanelMenuModule } from 'primeng/panelmenu';
import { AuthGuard } from './guards/auth.guard';

@NgModule({
  declarations: [HeaderComponent, SidebarComponent],
  imports: [
    CommonModule,
    RouterModule,
    MenubarModule,
    ButtonModule,
    MenuModule,
    SidebarModule,
    PanelMenuModule,
  ],
  providers: [httpInterceptorProviders, AuthGuard],
  exports: [HeaderComponent, SidebarComponent],
})
export class CoreModule {}
