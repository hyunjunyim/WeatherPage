import { Component, OnInit, NgModule, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackendService } from '../backend.service';
import { MatTabsModule } from '@angular/material/tabs';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import {Options} from 'highcharts';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpClientModule } from '@angular/common/http';
import {MatTableModule} from '@angular/material/table';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import highchartsWindbarb from 'highcharts/modules/windbarb';
import {NgbProgressbarConfig} from '@ng-bootstrap/ng-bootstrap';
import { AgmCoreModule } from '@agm/core';
import { trigger, transition, animate, style } from '@angular/animations'
// import { MouseEvent } from '@agm/core';

declare var require: any;
let Boost = require('highcharts/modules/boost');
let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');
let windBarb = require('highcharts/modules/windbarb');

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
noData(Highcharts);
windBarb(Highcharts);

interface tableCell {
  index: number;
  date: string;
  stat: number;
  maxTemp: number;
  minTemp: number;
  wsp: number;
}

interface marker {
  lat: number;
  lng: number;
  label?: string;
  draggable: boolean;
}

interface favList {
  index: number;
  cityValue: string;
  stateValue: string;
  locValue: number;
}

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translateX(-100%)'}),
        animate('200ms ease-in', style({transform: 'translateX(0%)'}))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({transform: 'translateX(-100%)'}))
      ])
    ]),
    trigger('slideOutIn', [
      transition(':enter', [
        style({transform: 'translateX(+100%)'}),
        animate('200ms ease-in', style({transform: 'translateX(100%)'}))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({transform: 'translateX(0%)'}))
      ])
    ])
  ]
})
export class WeatherComponent implements OnInit {
  apiOver: boolean = false;
  cityName: string = '';
  stateName:string = '';
  active = 1;
  active1 = 1;
  dataLoading: boolean = true;
  jsonData: any = [];
  tableData: any = [];
  isShown: boolean = false;
  loc: string = '';
  locData: any = [];
  datesArray: any = [];
  daysArray: any = [];
  hourlyArray: any = [];
  data1: any = [];
  displayedColumns: string[] = ['index', 'date','stat','maxTemp','minTemp','wsp'];
  dataSource: tableCell[] = [];
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: any;
  chart: typeof Highcharts = Highcharts;
  chartOptions1: any;
  meteogramArray: any = [];
  private winds: any[] = [];
  private humidity: any[] = [];
  private temperatures: any[] = [];
  private pressures: any[] = [];
  pointStart: any;
  rowClicked: boolean = false;
  showTable: boolean = false;
  rowDataGen: boolean = false;
  lat: any;
  lng: any;
  inFavorite: boolean = false;
  add_data:any = [];
  zoom: number = 8;
  dateLabel: string = '';
  favItems: favList[] = [];
  favEmpty: boolean = false;
  favs = JSON.parse(localStorage.getItem('favorites')||"{}");
  weatherCodeDict: any = {1000: ['Clear'],
                          1001: ['Cloudy'],
                          1100: ['Mostly Clear'],
                          1101: ['Partly Cloudy'], 
                          1102: ['Mostly Cloudy'],
                          2000: ['Fog'],
                          2100: ['Light Fog'],
                          3000: ['Light Wind'],
                          3001: ['Wind'],
                          3002: ['Strong Wind'],
                          4000: ['Drizzle'],
                          4001: ['Rain'],
                          4200: ['Light Rain'],
                          4201: ['Heavy Rain'],
                          5000: ['Snow'],
                          5001: ['Flurries'],
                          5100: ['Light Snow'],
                          5101: ['Heavy Snow'],
                          6000: ['Freezing Drizzle'],
                          6001: ['Freezing Rain'],
                          6200: ['Light Freezing Rain'],
                          6201: ['Heavy Freezing Rain'],
                          7000: ['Ice Pellets'],
                          7101: ['Heavy Ice Pellets'],
                          7102: ['Light Ice Pellets'],
                          8000: ['Thunderstorm']
                        };
  weatherCodeImg: any = {1000: ['../../assets/images/clear_day.svg'],
                        1001: ['../../assets/images/cloudy.svg'],
                        1100: ['../../assets/images/mostly_clear_day.svg'],
                        1101: ['../../assets/images/partly_cloudy_day.svg'], 
                        1102: ['../../assets/images/mostly_cloudy.svg'],
                        2000: ['../../assets/images/fog.svg'],
                        2100: ['../../assets/images/fog_light.svg'],
                        3000: ['../../assets/images/light_wind.svg'],
                        3001: ['../../assets/images/wind.svg'],
                        3002: ['../../assets/images/strong_wind.svg'],
                        4000: ['../../assets/images/drizzle.svg'],
                        4001: ['../../assets/images/rain.svg'],
                        4200: ['../../assets/images/rain_light.svg'],
                        4201: ['../../assets/images/rain_heavy.svg'],
                        5000: ['../../assets/images/snow.svg'],
                        5001: ['../../assets/images/flurries.svg'],
                        5100: ['../../assets/images/snow_light.svg'],
                        5101: ['../../assets/images/snow_heavy.svg'],
                        6000: ['../../assets/images/freezing_drizzle.svg'],
                        6001: ['../../assets/images/freezing_rain.svg'],
                        6200: ['../../assets/images/freezing_rain_light.svg'],
                        6201: ['../../assets/images/freezing_rain_heavy.svg'],
                        7000: ['../../assets/images/ice_pellets.svg'],
                        7101: ['../../assets/images/ice_pellets_heavy.svg'],
                        7102: ['../../assets/images/ice_pellets_light.svg'],
                        8000: ['../../assets/images/tstorm.svg']
                      };

  constructor(private route: ActivatedRoute, private backendService: BackendService, private http: HttpClient) { }

  processData() {
    this.jsonData = [];
    this.datesArray = [];
    this.daysArray = [];
    this.dataSource = [];
    this.hourlyArray = [];
    this.tableData = [];
    this.locData = [];
    this.data1 = [];
    this.meteogramArray = [];
    this.winds = [];
    this.humidity = [];
    this.temperatures = [];
    this.pressures = [];
    
    this.http.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${this.loc}&key=AIzaSyCG8KanuoYlwZddj-KIryt0lr5aEixQ2Dw`).subscribe((res)=> {
      this.add_data = res;
      this.cityName = this.add_data.results[0].address_components[3].long_name;
      this.stateName = this.add_data.results[0].address_components[5].long_name;
    })

    this.backendService.getWeatherData(this.loc).subscribe((data: any) => {
      this.jsonData = data;
      if (typeof this.jsonData.data == 'undefined') {
        this.apiOver = true;
        return;
      }
      console.log(this.weatherCodeDict);
      console.log(this.jsonData);
      if (this.jsonData.data.timelines.length > 0) {
        this.dataLoading = false;
      }
      else {
        this.dataLoading = true;
      }
      for (let i = 0; i < this.jsonData.data.timelines[2].intervals.length; i++) {
        var unixTime = new Date(this.jsonData.data.timelines[2].intervals[i].startTime);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var month = months[unixTime.getMonth()];
        var day = days[unixTime.getDay()];
        var dateNum = unixTime.getDate();
        var yrNum = unixTime.getFullYear();
        var formDate = day + ', ' + dateNum + ' ' + month + ' ' + yrNum;
        this.datesArray.push(formDate);
      }
      // console.log(this.datesArray);
      // this.daysArray = data.data.timelines[2].intervals;
      for (let j = 0; j < this.jsonData.data.timelines[2].intervals.length; j++) {
        this.daysArray.push(this.jsonData.data.timelines[2].intervals[j].values);
      }
      console.log(this.daysArray);
      console.log(this.datesArray);
      for (let k = 0; k < this.daysArray.length; k++) {
        let statCode = this.daysArray[k].weatherCode;
        this.dataSource.push( {
          "index": k+1,
          "date": this.datesArray[k],
          "stat": this.daysArray[k].weatherCode,
          "maxTemp": this.daysArray[k].temperatureMax,
          "minTemp": this.daysArray[k].temperatureMin,
          "wsp": this.daysArray[k].windSpeed
        })
      }
      console.log(this.favItems.length);
      console.log(this.favItems);
      console.log(this.dataSource);
      // for (let k = 0; k < )
      // console.log(this.daysArray);
      this.hourlyArray = data.data.timelines[1].intervals;

      for (var k = 0; k < this.jsonData.data.timelines[2].intervals.length; k++) {
        var unixTime1 = new Date(this.jsonData.data.timelines[2].intervals[k].startTime).getTime();
        this.data1.push([unixTime1, this.jsonData.data.timelines[2].intervals[k].values.temperatureMin, this.jsonData.data.timelines[2].intervals[k].values.temperatureMax]);
      }
      this.meteogramArray = data.data.timelines[1].intervals;
      // console.log(this.meteogramArray);
      for (let i = 0; i < this.meteogramArray.length; i++) {
        const x = new Date(this.meteogramArray[i].startTime).getTime(), to = this.meteogramArray.startTime ? x + 36e5: x+6*36e5;
        if (to > this.pointStart + 48 * 36e5 && this.meteogramArray[i].startTime == null) {
          return;
        }
        this.temperatures.push({
          x,
          y: this.meteogramArray[i].values.temperature
        });
        this.humidity.push({
          x,
          y: this.meteogramArray[i].values.humidity
        });
        if (i % 2 === 0) {
          this.winds.push({
            x,
            value: this.meteogramArray[i].values.windSpeed,
            direction: this.meteogramArray[i].values.windDirection
          });
        }
        this.pressures.push({
          x,
          y: this.meteogramArray[i].values.pressureSeaLevel
        });
        if (i === 0) {
          this.pointStart = (x + to) / 2;
        }
      }
      // console.log(this.data1);
      this.chartOptions = {
        plotOptions: {
          series: {
            fillColor: {
              linearGradient: [0,0,0,300],
              stops: [
                [0, '#F2AE36'],
                [1, Highcharts.color('#0b4572').setOpacity(0).get('rgba')]
              ]
            }
          }
        },
        chart: {
          type: 'arearange'
        },
        title: {
          text: 'Temperature Ranges (Min/Max)'
        },
        xAxis: {
          type: 'datetime',
          crosshair: true,
          labels: {
            step: 0
          }
        },
        yAxis: {
          title: {
            text: null
          }
        },
        tooltip: {
          shared: true,
          valueSuffix: '°F',
          xDateFormat: '%A, %b %e'
        },
        legend: {
          enabled: false
        },
        
        series: [{
          type: 'arearange',
          name: 'Temperature',
          data: this.data1
        }]
      };
      this.chartOptions1 = {
        title: {
          text: 'Hourly Weather (For Next 5 Days)',
          align: 'center',
          style: {
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
          }
        },
        tooltip: {
          shared: true,
          useHTML: true,
          headerFormat: '<small>{point.x: %A, %b %e, %H:%M}</small><br>'
        },
        xAxis: [{
          type: 'datetime',
          tickInterval: 2*36e5,
          minorTickInterval: 36e5,
          tickLength: 0,
          gridLineWidth: 1,
          gridLineColor: 'rgba(128,128,128,0.1',
          startOnTick: false,
          endOnTick: false,
          mindPadding: 0,
          maxPadding: 0,
          offset: 30,
          showLastLabel: true,
          labels: {
            format: '{value:%H}'
          },
          crosshair: true
        }, {
          linkedTo: 0,
          type: 'datetime',
          tickInterval: 24 * 3600 * 1000,
          labels: {
            format: '{value:<span style="font-size: 12px; font-weight: bold">%a</span> %b %e}',
            align: 'left',
            x: 3,
            y: -5
          },
          opposite: true,
          tickLength: 20,
          gridLineWidth: 1
        }],
        yAxis: [{
          title: {
            text: null
          },
          labels: {
            format: '{value}°',
            style: {
              fontSize: '10px'
            },
            x: -3
          },
          plotLines: [{
            value: 0,
            color: '#BBBBBB',
            width: 1,
            zIndex: 2
          }],
          maxPadding: 0.3,
          minRange: 8,
          tickInterval: 1,
          gridLineColor: 'rgba(128,128,128,0.1)'
        }, {
          title: {
            text: null
          },
          labels: {
            enabled: false
          },
          gridLineWidth: 0,
          tickLength: 0,
          minRange: 10,
          min: 0
        }, {
          allowDecimals: false,
          title: {
            text: 'inHg',
            offset: 0,
            align: 'high',
            rotation: 0,
            style: {
              fontSize: '10px',
              color: '#e4d354'
            },
            textAlign: 'left',
            x: 3
          },
          labels: {
            style: {
              fontSize: '8px',
              color: '#e4d354'
            },
            y: 2,
            x: 3
          },
          gridLineWidth: 0,
          opposite: true,
          showLastLabel: false
        }],
        legends: {
          enabled: false
        },
        plotOptions: {
          series: {
            pointPlacement: 'between'
          }
        },
        series: [{
          name: 'Temperature',
          data: this.temperatures,
          type: 'spline',
          marker: {
            enabled: false,
            states: {
              hover: {
                enabled: true
              }
            }
          },
          tooltip: {
            pointFormat: '<span style="color:{point.color}">\u25CF</span> '+'{series.name}: <b>{point.y}°C</b><br/>'
          },
          zIndex: 1,
          color: '#FF3333',
          negativeColor: '#48AFE8'
        }, {
          name: 'Humidity',
          data: this.humidity,
          type: 'column',
          color: '#68CFE8',
          yAxis: 1,
          groupPadding: 0,
          pointPadding: 0,
          goruping: false,
          dataLabels: {
            enabled: true,
            format: '{point.y: ,.0f}',
            filter: {
              operator: '>',
              property: 'y',
              value: 0
            },
            style: {
              fontSize: '8px',
              color: 'gray'
            }
          },
          tooltip: {
            valueSuffix: ' %'
          }
        }, {
          name: 'Air Pressure',
          color: '#e4d354',
          data: this.pressures,
          marker: {
            enabled: false
          },
          shadow: false,
          tooltip: {
            valueSuffix: ' inHg'
          },
          dashStyle: 'shortdot',
          yAxis: 2
        }, {
          name: 'Wind', 
          type: 'windbarb',
          id: 'windbarbs',
          color: '#910000',
          lineWidth: 1.5,
          data: this.winds,
          vectorLength: 8,
          xOffset: -5,
          yOffset: -15,
          tooltip: {
              valueSuffix: ' mph'
          }
        }]
      }
    });
  }
  showClicked(index: number) {
    this.rowClicked = true;
    this.showTable = false;
    this.rowDataGen = true;
    this.tableData = [];
    this.backendService.getWeatherData(this.loc).subscribe((data: any) => {
      this.jsonData = data;
      this.tableData = this.jsonData.data.timelines[2].intervals[index-1].values;
      this.dateLabel = this.datesArray[index-1];
    })
  }
  checkfavorites() {
    let favArr = localStorage.getItem('favorites')
      ? JSON.parse(localStorage.getItem('favorites')||'{}')
      : [];
    if (!favArr.length) {
      this.favEmpty = true;
    }
    let result = favArr.filter(
      (data: any) => data.loc === this.loc
    );
    if (result.length) {
      this.inFavorite = true;
    } else {
      this.inFavorite = false;
    }
    console.log("Fav items here");
    console.log(favArr);
  }

  public onClickStar() {
    this.inFavorite = !this.inFavorite;
    let favArr, favArrNew;

    favArr = localStorage.getItem('favorites')
      ? JSON.parse(localStorage.getItem('favorites')||'{}')
      : [];
    if (this.inFavorite) {
      let favoritesItemNew = {
        city: this.cityName,
        state: this.stateName,
        loc: this.loc
      };
      favArr.push(favoritesItemNew);
      localStorage.setItem('favorites', JSON.stringify(favArr));
      this.favEmpty = false;
    } else {
      favArrNew = favArr.filter(
        ((data: any) => data.loc != this.loc)
      );
      localStorage.setItem('favorites', JSON.stringify(favArrNew));
      this.favEmpty = false;
    }
    this.favs = JSON.parse(localStorage.getItem('favorites')||'{}');
    console.log(this.inFavorite);
    console.log(this.favs);
  }
  public onClickTrash() {
    let favArr, favArrNew;
    favArr = localStorage.getItem('favorites')
      ? JSON.parse(localStorage.getItem('favorites')||'{}')
      : [];
    favArrNew = favArr.filter(
      ((data: any) => data.loc != this.loc)
    );
    if (!favArrNew.length) {
      this.favEmpty = true;
    }
    localStorage.setItem('favorites', JSON.stringify(favArrNew));
    this.favs = JSON.parse(localStorage.getItem('favorites')||'{}');
    this.inFavorite = false;
    // if(JSON.parse(localStorage.getItem('favorites')||'{}') == []) {
    //   this.favEmpty = true;
    // }
    console.log(this.favs.length);
  }
  toggleView() {
    this.showTable = !this.showTable;
    this.rowClicked = !this.rowClicked;
  }
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.loc = <string>params.get('loc');
      console.log(this.loc);
      this.checkfavorites()
      this.lat = parseFloat(this.loc.split(',')[0]);
      this.lng = parseFloat(this.loc.split(',')[1]);
      this.processData();
      this.isShown = true;
      this.showTable = true;
      this.rowClicked = false;
      this.rowDataGen = false;
    });
  }
}
