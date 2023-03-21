import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingPageComponent } from './components/landing-page.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AuthModule } from '../auth/auth.module';

@NgModule({
  declarations: [LandingPageComponent],
  imports: [CommonModule, CardModule, ButtonModule, AuthModule],
  exports: [LandingPageComponent],
})
export class LandingPageModule {}
