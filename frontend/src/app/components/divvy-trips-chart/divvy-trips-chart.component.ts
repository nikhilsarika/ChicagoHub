import { Component, OnInit ,Input,Output,EventEmitter} from '@angular/core';
import * as moment from 'moment'
import * as d3 from 'd3';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';

import { divvyTripsCountPerDay } from '../../DivvyTripsCountPerDay';
import { PlacesService } from '../../places.service';
import { HttpClient } from '@angular/common/http';
import {FormBuilder, FormGroup} from '@angular/forms';

import { Router } from '@angular/router';
import {NgbDateStruct, NgbCalendar} from '@ng-bootstrap/ng-bootstrap';



@Component({
  selector: 'app-divvy-trips-chart',
  templateUrl: './divvy-trips-chart.component.html',
  styleUrls: ['./divvy-trips-chart.component.css']
})
export class DivvyTripsChartComponent implements OnInit {

  divvyTripsCounts: divvyTripsCountPerDay[]=[];

  private margin = { top: 20, right: 100, bottom: 150, left: 100 };
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;
  private g: any;
  datepickerDisabled: any;
  collectDays = [];

  startDate;
  endDate;
  dates_of_week_days;

  chart_1_name:string;
  chart_2_name:string;
  chart_3_name:string;
  chart_4_name:string;
  chart_5_name:string;
  chart_6_name:string;
  chart_7_name:string;


  minDate: Date;
  maxDate: Date;
  date: Date;
  form: FormGroup;


  constructor(private placesService: PlacesService, private router: Router, private http: HttpClient,fb: FormBuilder) {
    this.width = 900 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
    this.form = fb.group({
      date: [{begin: new Date(2018, 9, 8), end: new Date(2018, 9, 14)}]
    });

  }



  ngOnInit() {
  

  }


}
