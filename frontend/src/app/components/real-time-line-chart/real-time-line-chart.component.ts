import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Observable } from "rxjs";
import 'rxjs/add/observable/interval';
import { Subscription } from 'rxjs/Subscription';

import * as d3 from 'd3';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import * as d3Time from 'd3-time-format';

import { Station } from '../../station';
import { Dock } from '../../dock';

import { PlacesService } from '../../places.service';
import { VERSION } from '@angular/material/core';



@Component({
    selector: 'app-real-time-line-chart',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './real-time-line-chart.component.html',
    styleUrls: ['./real-time-line-chart.component.css']
})


export class RealTimeLineComponent implements OnInit {


     ngOnInit() {


     }



}
