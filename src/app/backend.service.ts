import { Host, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { HOST } from './host-name';

const geo_key = 'AIzaSyCG8KanuoYlwZddj-KIryt0lr5aEixQ2Dw';
const ipinfo_key = 'f8302db60deeef';
const geo_url = 'https://maps.googleapis.com/maps/api/geocode/json?address='
const ipinfo_url = 'https://ipinfo.io/json?token=f8302db60deeef'

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  private locURL = HOST + 'api/';
  private autoURL = HOST + 'autoapi/';

  constructor(private http: HttpClient) {}

  getAuto(cityInput: string) {
    return this.http.get<any>(this.autoURL + cityInput);
  }

  getWeatherData(loc: string) {
    return this.http.get<any>(this.locURL + loc);
  }


  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}