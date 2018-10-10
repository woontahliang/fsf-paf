import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { AddRsvpFormComponent } from './components/add-rsvp-form/add-rsvp-form.component';
import { DisplayRsvpsFormComponent } from './components/display-rsvps-form/display-rsvps-form.component';

import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RsvpService } from './services/rsvp/rsvp.service';

@NgModule({
  declarations: [
    AppComponent,
    AddRsvpFormComponent,
    DisplayRsvpsFormComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [RsvpService],
  bootstrap: [AppComponent]
})
export class AppModule { }
