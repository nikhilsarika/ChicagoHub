import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Place } from '../../place';
import { PlacesService } from '../../places.service';

import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './yelp-reviews-bar-chart.component.html',
  styleUrls: ['./yelp-reviews-bar-chart.component.css']
})




        
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////


export class BarChartComponent implements OnInit {

  title = "Yelp Reviews Chart";
  private places: Place[];
  private width: number;
  private height: number;
  private margin = {top: 20, right: 20, bottom: 150, left: 80};

  private x: any;
  private y: any;
  private svg: any;
  private g: any;

  
        
  ///////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////


  constructor(private placesService: PlacesService) {}


        
  ///////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////


  ngOnInit() {


  }


}
