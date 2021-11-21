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

    


    private margin = {top: 50, right: 20, bottom: 30, left: 150};
    private width: number;
    docks: Dock[];
    validDocks: Dock[];
    requiredDockData : Dock[] ;
    timeRangeSelected: string;

    stationSelected:Station;
    value:number;
    SMALineChart:Subscription;
    LineChart: Subscription;
    stationNameSelected: string;
    title: string;
    padding = 1;


    timeRanges = [
       { id : '1 HOUR', value: 'Past Hour'},
       { id : '24 HOUR', value: 'Last 24 Hours'},
       { id : '7 DAY', value: 'Last 7 Days'}
     ];

    private height: number;
    private x: any;
    private y: any;
    private svg: any;
    private line: d3Shape.Line<[number, number]>;

    private movingAverageLine1: d3Shape.Line<[number, number]>;
    private movingAverageLine: d3Shape.Line<[number, number]>;
    version = VERSION;


   ///////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////

    constructor(private placesService: PlacesService) {
        this.width = 900 - this.margin.left - this.margin.right;
        this.height = 500 - this.margin.top - this.margin.bottom;
    }


   ///////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////


    ngOnInit() {
        if (this.SMALineChart !== undefined) {
            this.SMALineChart.unsubscribe();
   }
        this.timeRangeSelected ="1 HOUR";
        this.stationNameSelected = this.placesService.stationNameSelected;
        this.title = 'Divvy Dock Station:    ' + this.stationNameSelected;
        this.createPriodicTaskToPullStationDataFromServer();

    }

   
   ///////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////


   changeTimeRangeSelected(data){
       this.build_d3_chart('#008000',0,this.timeRangeSelected);
   }

   

   ///////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////


   createPriodicTaskToPullStationDataFromServer(){

    if (this.SMALineChart !== undefined) {
        this.SMALineChart.unsubscribe();
}

       this.placesService.getStationSelected().subscribe((data: Station) => {
         this.stationSelected = data;
         this.SMALineChart = this.placesService.pulledNewStationDocksDataFromServer(this.placesService.stationNameSelected, this.timeRangeSelected).subscribe(res => {
           this.create_d3_chart(this.placesService.stationNameSelected,this.placesService,this.timeRangeSelected);
         });
       });
   }

     
   ///////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////


   build_d3_chart(color,value,type){
     this.placesService.getStationSelected().subscribe((data: Station) => {
          this.stationSelected = data;
          this.create_d3_chart(this.stationSelected.stationName,this.placesService,this.timeRangeSelected);
     });

   }

       
   ///////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////


   create_d3_chart(stationName,placesService,timeRange) {

    if (this.SMALineChart !== undefined) {
        this.SMALineChart.unsubscribe();
}
     

     this.stationNameSelected = stationName;
     this.title = 'Divvy Dock Station:    ' + this.stationNameSelected;
       
     placesService.getStationDocksLog(stationName,timeRange).subscribe(() => {
        this.fetchDocks(placesService,timeRange);
     });
   }


       
   ///////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////


   fetchDocks(placesService,timeRange) {

        placesService
          .getDocks()
             .subscribe((data: Dock[]) => {
                   this.docks = data;
                //    console.log("all docks: "+this.docks)
                   var uniqueDocks = this.getUniqueListBy(this.docks,'lastCommunicationTime') as Dock[];
                   console.log('log1: unique docks')
                   console.log(uniqueDocks);
                   
                   this.updateChart();
                   this.initSvg();
                   this.initAxis();
                   this.create_d3_chart_legend(timeRange);
                   this.create_d3_chart_X_Y_Axis(timeRange);
                   this.create_d3_line();
                   this.create_d3_movingAverageLine();
                   this.create_d3_movingAverageLine1();
                   this.claculate_sma(uniqueDocks);
             });
   }


   
   ///////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////


   private initSvg() {
        this.svg = d3.select('#svg')
            .append('g')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
   }

   private initAxis() {
        this.x = d3Scale.scaleTime().range([0, this.width]);
        this.y = d3Scale.scaleLinear().range([this.height, 0]);

        this.x.domain(d3Array.extent(this.docks, (d) => new Date(d.lastCommunicationTime.replace(/-/g,'/').toString() )));
        this.y.domain([0, d3Array.max(this.docks, (d) => d.availableDocks)]);

   }


       
   ///////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////


   private setTimeIncrementFor_X_Axis(timeRange){
      if(timeRange=="1 HOUR"){
           this.svg.append('g')
           .attr('class', 'axis axis--x')
           .attr('transform', 'translate(0,' + this.height + ')')
           .call(d3Axis.axisBottom(this.x)
           .ticks(d3.timeMinute.every(2)))
           .selectAll("text")
           .attr("y", 0)
           .attr("x", 9)
           .attr("dy", ".35em")
           .attr("transform", "rotate(45)")
           .style("text-anchor", "start")
      }
      else if(timeRange=="24 HOUR"){
               this.svg.append('g')
               .attr('class', 'axis axis--x')
               .attr('transform', 'translate(0,' + this.height + ')')
               .call(d3Axis.axisBottom(this.x)
               .ticks(d3.timeHour.every(1)))
               .selectAll("text")
               .attr("y", 0)
               .attr("x", 9)
               .attr("dy", ".35em")
               .attr("transform", "rotate(45)")
               .style("text-anchor", "start")
           }
           else if(timeRange=="7 DAY"){

                         this.svg.append('g')
                         .attr('class', 'axis axis--x')
                         .attr('transform', 'translate(0,' + this.height + ')')
                         .call(d3Axis.axisBottom(this.x)
                         .ticks(d3.timeHour.every(12)))
                         .selectAll("text")
                         .attr("y", 0)
                         .attr("x", 9)
                         .attr("dy", ".35em")
                         .attr("transform", "rotate(45)")
                         .style("text-anchor", "start")

                 }

   }



       
   ///////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////


   private create_d3_chart_X_Y_Axis(timeRange) {

       this.svg.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', 'translate(0,' + this.height + ')')
            .append('text')
            .attr('class', 'axis-title')
            .attr('text-anchor', 'middle')
            .attr('transform', 'translate(420,50)')
            .text('Time');

       this.setTimeIncrementFor_X_Axis(timeRange);

       this.svg.append('g')
            .attr('class', 'axis axis--y')
            .call(d3Axis.axisLeft(this.y))
            .append('text')
            .attr('class', 'axis-title')
            .attr("transform", "translate("+ 1 +","+(this.height/2)+")rotate(90)")  
            .attr('y', 35)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text('Available Docks');
   }


   

   ///////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////


   private create_d3_line() {
       this.line = d3Shape.line()
            .x( (d: any) => this.x(new Date(d.lastCommunicationTime.replace(/-/g,'/').toString()) ))
            .y( (d: any) => this.y(d.availableDocks) );
       this.svg.append('path')
            .datum(this.docks)
            .attr('class', 'line')
            .attr('d', this.line);


   }

   private claculate_sma(uniqueDocks){
       this.validDocks = [];
       this.placesService.getStationDocksLog(this.stationSelected.stationName,'48 HOUR').subscribe(
           docksData => {
                console.log('log2: docksData')
                console.log(docksData);
                var totalDocks : Dock[]= docksData as Dock[];
                console.log(totalDocks);
                if (uniqueDocks !== undefined){
                    uniqueDocks.forEach(element => {
                        var timeFromDocks = new Date(element.lastCommunicationTime.replace(/-/g,'/').toString());
                        timeFromDocks = new Date(timeFromDocks.getTime()-60 * 60 * 1000);
                        
                        totalDocks.forEach(totalDocksElement => {
                            var timeFromTotalDocks = new Date(totalDocksElement.lastCommunicationTime.replace(/-/g,'/').toString());
                            if(timeFromTotalDocks>timeFromDocks){
                                this.validDocks.push(totalDocksElement as Dock);
                            }
                        });
                        var sum : number= 0;
                        var sma : any;
                        this.validDocks.forEach(totalDocksElement => {
                            sum = sum + totalDocksElement.availableDocks.valueOf();
                        });
                        sma = sum / this.validDocks.length;
                        console.log('log 6 : sma '+sma);
                    });
                }
           }
       );
    //    console.log('log3: requiredDockData')
    //    console.log(this.requiredDockData);
    //    console.log('after reqired dock data');
    //    uniqueDocks.forEach(element => {
    //         var currentTime = new Date();
    //         var lastHour= new Date(currentTime.getTime()-60 * 60 * 1000);
    //         var last24Hours = new Date(currentTime.getTime()- (24 * -60 * 60 * 1000));
    //         var timeFromDocks = new Date(element.lastCommunicationTime.replace(/-/g,'/').toString())
    //         if(timeFromDocks>lastHour){
    //             this.validDocks.push(element as Dock);
    //         }
    //     });
    //     console.log('log4: validDocks')
    //     console.log(this.validDocks);
    //     console.log('log5: end of logs')
   }

   private calculate_sma_1hr(uniqueDocks,totalDocksData){
        if (uniqueDocks !== undefined){
            uniqueDocks.forEach(element => {
                var currentTime = new Date();
                var lastHour= new Date(currentTime.getTime()-60 * 60 * 1000);
                var last24Hours = new Date(currentTime.getTime()- (24 * -60 * 60 * 1000));
                var timeFromDocks = new Date(element.lastCommunicationTime.replace(/-/g,'/').toString());
                timeFromDocks = new Date(timeFromDocks.getTime()-60 * 60 * 1000);
                
                totalDocksData.array.forEach(totalDocksElement => {
                    var timeFromTotalDocks = new Date(totalDocksElement.lastCommunicationTime.replace(/-/g,'/').toString());
                    if(timeFromTotalDocks>timeFromDocks){
                        this.validDocks.push(totalDocksElement as Dock);
                    }
                });
                var sum : number= 0;
                var sma : any;
                this.validDocks.forEach(totalDocksElement => {
                    sum = sum + totalDocksElement.availableDocks.valueOf();
                });
                sma = sum / this.validDocks.length;
                console.log('log 6 : sma '+sma);
            });
        }
   }

   private getUniqueListBy(arr, key) {
    return [...new Map(arr.map(item => [item[key], item])).values()]
   }

   private create_d3_movingAverageLine1() {
    this.movingAverageLine1 = d3Shape.line()
         .x( (d: any) => this.x(new Date(d.lastCommunicationTime.replace(/-/g,'/').toString()) ))
         .y( (d: any) => this.y(d.availableDocks) );
    this.svg.append('path')
         .datum(this.docks)
         .attr('class', 'sma_line_24hr')
         .attr('d', this.movingAverageLine1);


    }
    private create_d3_movingAverageLine() {
        this.movingAverageLine = d3Shape.line()
             .x( (d: any) => this.x(new Date(d.lastCommunicationTime.replace(/-/g,'/').toString()) ))
             .y( (d: any) => this.y(d.availableDocks) );
        this.svg.append('path')
             .datum(this.docks)
             .attr('class', 'sma_line_1hr')
             .attr('d', this.movingAverageLine);
    
    
    }



   

   ///////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////


   private create_d3_chart_legend(timeRange) {

     var legend = this.svg.append('g')
                             .attr("class", "legend")
                             .attr("x", 15)
                             .attr("y", 5)
                             .attr('transform','translate(860,5)')
                             .attr("width", 18)
                             .attr("height", 10)

     if(timeRange == "1 HOUR") {
             legend.append("rect")
                       .attr("class", "legend")
                       .attr("x", 1)
                       .attr("y", 5)
                       .attr("width", 15)
                       .attr("height", 7)
                       .style("fill", 'green');

             legend.append("text")
                       .attr("class", "legendTxt")
                       .style("font-size", "13px")
                       .attr("x", 20)
                       .attr("y", 5)
                       .attr("dy", "10px")
                       .style("text-anchor", "start")
                       .text("Real-Time Data" );

             legend.append("rect")
                       .attr("class", "legend")
                       .attr("x", 1)
                       .attr("y", 20)
                       .attr("width", 15)
                       .attr("height", 7)
                       .style("fill", 'blue');

             legend.append("text")
                       .attr("class", "legendTxt")
                       .style("font-size", "13px")
                       .attr("x", 20)
                       .attr("y", 20)
                       .attr("dy", "10px")
                       .style("text-anchor", "start")
                       .text("SMA - 1 HOUR");
            
             legend.append("rect")
                       .attr("class", "legend")
                       .attr("x", 1)
                       .attr("y", 35)
                       .attr("width", 15)
                       .attr("height", 7)
                       .style("fill", 'red');

             legend.append("text")
                       .attr("class", "legendTxt")
                       .style("font-size", "13px")
                       .attr("x", 20)
                       .attr("y", 35)
                       .attr("dy", "10px")
                       .style("text-anchor", "start")
                       .text("SMA - 24 HOURS");
     }
     else if(timeRange == "24 HOUR") {
                 legend.append("rect")
                           .attr("class", "legend")
                           .attr("x", 1)
                           .attr("y", 5)
                           .attr("width", 15)
                           .attr("height", 7)
                           .style("fill", 'green');

                 legend.append("text")
                           .attr("class", "legendTxt")
                           .style("font-size", "13px")
                           .attr("x", 20)
                           .attr("y", 5)
                           .attr("dy", "10px")
                           .style("text-anchor", "start")
                           .text("Real-Time Data");
                
                 legend.append("rect")
                           .attr("class", "legend")
                           .attr("x", 1)
                           .attr("y", 20)
                           .attr("width", 15)
                           .attr("height", 7)
                           .style("fill", 'blue');

                 legend.append("text")
                           .attr("class", "legendTxt")
                           .style("font-size", "13px")
                           .attr("x", 20)
                           .attr("y", 20)
                           .attr("dy", "10px")
                           .style("text-anchor", "start")
                           .text("SMA - 1 HOUR");
                
                 legend.append("rect")
                           .attr("class", "legend")
                           .attr("x", 1)
                           .attr("y", 35)
                           .attr("width", 15)
                           .attr("height", 7)
                           .style("fill", 'red');

                 legend.append("text")
                           .attr("class", "legendTxt")
                           .style("font-size", "13px")
                           .attr("x", 20)
                           .attr("y", 35)
                           .attr("dy", "10px")
                           .style("text-anchor", "start")
                           .text("SMA - 24 HOURS");
           }
           else if(timeRange == "7 DAY") {
                         legend.append("rect")
                                   .attr("class", "legend")
                                   .attr("x", 1)
                                   .attr("y", 5)
                                   .attr("width", 15)
                                   .attr("height", 7)
                                   .style("fill", 'green');

                         legend.append("text")
                                   .attr("class", "legendTxt")
                                   .style("font-size", "13px")
                                   .attr("x", 20)
                                   .attr("y", 5)
                                   .attr("dy", "10px")
                                   .style("text-anchor", "start")
                                   .text("Real-Time Data");
                         
                         legend.append("rect")
                                   .attr("class", "legend")
                                   .attr("x", 1)
                                   .attr("y", 20)
                                   .attr("width", 15)
                                   .attr("height", 7)
                                   .style("fill", 'blue');

                         legend.append("text")
                                   .attr("class", "legendTxt")
                                   .style("font-size", "13px")
                                   .attr("x", 20)
                                   .attr("y", 20)
                                   .attr("dy", "10px")
                                   .style("text-anchor", "start")
                                   .text("SMA - 1 HOUR");
                        
                         legend.append("rect")
                                   .attr("class", "legend")
                                   .attr("x", 1)
                                   .attr("y", 35)
                                   .attr("width", 15)
                                   .attr("height", 7)
                                   .style("fill", 'red');

                         legend.append("text")
                                   .attr("class", "legendTxt")
                                   .style("font-size", "13px")
                                   .attr("x", 20)
                                   .attr("y", 35)
                                   .attr("dy", "10px")
                                   .style("text-anchor", "start")
                                   .text("SMA - 24 HOURS");
                 }

   }


   

   ///////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////


   private updateChart(){

      var chart = d3.select('#svg').select("g").remove().exit();


   }

   

   ///////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////



   ngOnDestroy() {

    if (this.SMALineChart !== undefined) {
        this.SMALineChart.unsubscribe();
    }

   }



}