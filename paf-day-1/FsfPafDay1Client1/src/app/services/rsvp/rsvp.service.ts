import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { IRsvp } from '../../models/irsvp.interface';

@Injectable({
  providedIn: 'root'
})
export class RsvpService {

  constructor(private http: HttpClient) { }

  addRsvp(info: IRsvp): Promise<boolean> {
    const formData = new HttpParams()
      .set('email', info.email)
      .set('given_name', info.given_name)
      .set('phone', info.phone)
      .set('attending', info.attending)
      .set('remarks', info.remarks)
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded');

    return (
      this.http.post<boolean>(environment.rsvp_url + '/api/rsvp',
        formData.toString(),
        { headers: headers }
      ).toPromise()
        .then(() => true)
        .catch(() => false)
    );
  }
}
