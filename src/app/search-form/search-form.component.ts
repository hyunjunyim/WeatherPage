import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { BackendService } from '../backend.service';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { Options } from 'ngx-google-places-autocomplete/objects/options/options';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {Location} from '@angular/common';

const geo_key = 'api-key';
const geo_url = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
const ipinfo_url = 'https://ipinfo.io/json?token=api-key';

let header = new HttpHeaders();
header.set('Access-Control-Allow-Origin','*');

interface filtering {
  index: number;
  cityFil: string;
  stateFil: string;
}

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.css']
})
export class SearchFormComponent implements OnInit {
  active = 1;
  isSubmitted: boolean = false;
  isClicked: boolean = false;
  private data:any = []
  private lat:any = ''
  private long: any =''
  private loc: string =''
  jsonRes: any = [];
  checkedBox: boolean = false;
  inputPair: string[] = [];
  filteredLoc: filtering[] = [];
  placesRes: any = [];
  cityInput: string = '';
  cityName: string = '';
  stateName: string = '';
  formValid: boolean = false;
  cityValid: boolean = true;
  streetValid: boolean = true;
  stateValid: boolean = true;
  searchForm = new FormGroup({
    streetInput: new FormControl('', [Validators.required]),
    cityInput: new FormControl('', [Validators.required]),
    stateInput: new FormControl('', [Validators.required])
  });
  constructor(private _location: Location, private backendService: BackendService, private http: HttpClient, private router: Router, private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute) { }

  onSubmit() {
    this.isSubmitted = true;
    this.data = [];
    this.jsonRes = [];
    this.isClicked = false;
    if (!this.searchForm.invalid && !this.checkedBox) {
      this.formValid = true;
      console.log("The complete address from your input is: " + this.searchForm.controls.streetInput.value + this.searchForm.controls.cityInput.value + this.searchForm.controls.stateInput.value + ".");
      var madeAddress = this.searchForm.controls.streetInput.value.split(' ').join('+') + "+" + this.searchForm.controls.cityInput.value.split(' ').join('+') + "+" + this.searchForm.controls.stateInput.value.split(' ').join('+');
      console.log(madeAddress);
      var compURL = geo_url + madeAddress + "&key=" + geo_key;
      console.log(compURL);
      this.http.get(compURL).subscribe((res) => {
        this.data = res;
        this.lat = this.data.results[0].geometry.location.lat;
        this.long = this.data.results[0].geometry.location.lng;
        this.loc = this.lat + "," + this.long;
        this.router.navigateByUrl('/weather/' + this.loc);
      })
      
    }
    else if (!this.searchForm.invalid && this.checkedBox) {
      console.log("Auto detection enabled");
      this.http.get(ipinfo_url).subscribe((res) => {
        this.data = res;
        this.loc = this.data.loc;
        this.router.navigateByUrl('/weather/'+this.loc);
      })
    }
  }
  refresh() {
    // this.router.navigateByUrl('/');
    // this.searchForm.reset();
    // this.searchForm.markAsPristine();
    // this.searchForm.markAsUntouched();
    this.isSubmitted = false;
    this._location.back();
    // this.searchForm.resetForm();
    // this.data = [];
    // this.jsonRes = [];
    // this.isClicked = false;
  }
  autoDetect() {
    this.checkedBox = !this.checkedBox;
    console.log(this.checkedBox);
    if (this.checkedBox == true) {
      this.searchForm.controls.cityInput.disable();
      this.searchForm.controls.stateInput.disable();
      this.searchForm.controls.streetInput.disable();
      this.formValid = true;
    }
    else {
      this.searchForm.controls.cityInput.enable();
      this.searchForm.controls.stateInput.enable();
      this.searchForm.controls.streetInput.enable();
    }
  }
  toggle() {
    this.isSubmitted = !this.isSubmitted;
    this.isClicked = !this.isClicked;
  }
  ngOnInit() {
    this.checkedBox = false;
    this.searchForm = this.formBuilder.group({
      streetInput: '',
      cityInput: '',
      stateInput: ''
    });
    this.searchForm.controls.streetInput.valueChanges.subscribe((value: any) => {
      if (value.replace(' ', '').length == 0 && !this.checkedBox) {
        this.streetValid = false;
      }
    })
    this.searchForm.controls.cityInput.valueChanges
      .subscribe((value:any) => {
        if (value.length >= 3) {
          this.cityInput = value;
          console.log(typeof this.cityInput);
          this.backendService.getAuto(this.cityInput).subscribe((data: any) => {
            this.placesRes = data;
            for (let i = 0; i < this.placesRes.predictions.length; i++) {
              this.filteredLoc.push({
                "index": i + 1,
                "cityFil": this.placesRes.predictions[i].terms[0].value,
                "stateFil": this.placesRes.predictions[i].terms[1].value
              });
            }
            console.log(this.filteredLoc);
          })
        }
        else if (value.length >= 1 && value.replace(' ','').length == 0 && !this.checkedBox) {
          this.cityValid = false;
        }
        else {
          this.filteredLoc = [];
        }
    });
    this.searchForm.valueChanges.subscribe(() => {
      if (this.searchForm.controls.cityInput.value.replace(' ','').length > 0 && this.searchForm.controls.streetInput.value.replace(' ','').length > 0 && this.searchForm.controls.stateInput.value.replace(' ','').length > 0) {
        this.formValid = true;
      }
    })
  }
  fillForm(index: number) {
      this.searchForm.controls['cityInput'].setValue(this.filteredLoc[index-1].cityFil);
      this.searchForm.controls['stateInput'].setValue(this.filteredLoc[index-1].stateFil);
      this.formValid = true;
  }
}
