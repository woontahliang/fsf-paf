import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddRsvpFormComponent } from './components/add-rsvp-form/add-rsvp-form.component';
import { DisplayRsvpsFormComponent } from './components/display-rsvps-form/display-rsvps-form.component';

const routes: Routes = [
  { path: '', redirectTo: '/add-rsvp', pathMatch: 'full' },
  { path: 'add-rsvp', component: AddRsvpFormComponent },
  { path: 'display-rsvps', component: DisplayRsvpsFormComponent },
  { path: '**', redirectTo: '/add-rsvp' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [AddRsvpFormComponent, DisplayRsvpsFormComponent]
