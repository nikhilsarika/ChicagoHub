////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


/// This file and the source code provided can be used only for
/// the projects and assignments of this course

/// Last Edit by Dr. Atef Bader: 7/24/2021


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////




import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { HttpHeaders } from '@angular/common/http';



import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';


import { Place } from './place';
import { Station } from './station';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};


@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  uri = 'http://localhost:4000';
  Emmiter;
  time_interval;
  stationNameSelected = 'None';

  
  constructor(private http: HttpClient) {


  }


  getPlaces() : Observable<Place[]> {
    return this.http.get<Place[]>(`${this.uri}/places`);
  }


  getPlaceSelected() {
    return this.http.get(`${this.uri}/place_selected`);
  }
  getStationSelected() {
    return this.http.get(`${this.uri}/station_selected`);
  }


  getStations() {
    return this.http.get(`${this.uri}/stations`);
  }



  findPlaces(find, where) {
    const find_places_at = {
      find: find,
      where: where
    };
    return this.http.post(`${this.uri}/places/find`,find_places_at,httpOptions);

    /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////


    /////////////     ADD YOUR CODE HERE      ///////////
    
    // Write your code to call plases/find on the server

    //  Add return this.http.post(`${this.uri}/places/find`, find_places_at ....


    /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////



  }




  findStations(placeName) {
    const find_stations_at = {
      placeName: placeName
    };

    var str = JSON.stringify(find_stations_at, null, 2);
    return this.http.post(`${this.uri}/stations/find`,find_stations_at,httpOptions);
    /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////


    /////////////     ADD YOUR CODE HERE      ///////////
    
    // Write your code to call stations/find on the server

    // Add return this.http.post(`${this.uri}/stations/find ...

    /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////


  }
    
}
