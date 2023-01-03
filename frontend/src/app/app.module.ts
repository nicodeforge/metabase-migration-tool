import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {SelectButtonModule} from 'primeng/selectbutton';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SelectButtonModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
