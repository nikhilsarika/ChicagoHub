import {
    Component,
    ViewEncapsulation,
    OnInit
} from '@angular/core';
import {
    Observable
} from "rxjs";
import 'rxjs/add/observable/interval';
import {
    Subscription
} from 'rxjs/Subscription';

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
    selector: 'app-real-time-sma-line-chart',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './real-time-sma-line-chart.component.html',
    styleUrls: ['./real-time-sma-line-chart.component.css']
})
export class RealTimeSMALineComponent implements OnInit {

    /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////


    /////////////     ADD YOUR CODE HERE      ///////////

    // Write your code SIMILAR to real-time-chart component
    // real-time-sma-line-chart.component.html MUST BE UPDATED as well
    // Update list-of-stations.component.ts by adding somtehing similar to getLineChart(stationName)
    // Update list-of-stations.component.html by adding somtehingsimilar to (click)="getLineChart(element.stationName)


    /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////

    ngOnInit() {


    }

}