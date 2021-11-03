import { AfterViewInit, Component,Input,ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import * as heatmap from 'heatmap.js'
import { google } from 'google-maps';

import { Station } from '../../station';
import { PlacesService } from '../../places.service';
import { Observable } from "rxjs";
import 'rxjs/add/observable/interval';
import { Subscription } from 'rxjs/Subscription';
import * as moment from 'moment';

interface Location {
  lat: number;
  lng: number;
  zoom: number;
  address_level_1?:string;
  address_level_2?: string;
  address_country?: string;
  address_zip?: string;
  address_state?: string;
  label: string;
}

@Component({
  selector: 'heatmap',
  templateUrl: './heat-map.component.html',
  styleUrls: ['./heat-map.component.scss']
})


export class HeatMapComponent implements OnInit{


    constructor(private placesService:PlacesService) {}


    ngOnInit() {

    }


}

