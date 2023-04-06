const tmr_key = 'FhCioXeQJ94qvp6e4aJIETa6uxB5DJio';
// const tmr_key = 'AkeJ5Mgq4eZP2AADF1gR6PRPr8YqKUPP';
const params = 'temperature,temperatureApparent,temperatureMin,temperatureMax,windSpeed,windDirection,humidity,pressureSeaLevel,uvIndex,weatherCode,precipitationProbability,precipitationType,sunriseTime,sunsetTime,visibility,moonPhase,cloudCover'


const fetch = require('node-fetch');
// import {fetch} from 'node-fetch';
const async = require('express-async-await');
const url = require('url');
const https = require('https');
const HttpsProxyAgent = require('https-proxy-agent');

module.exports.getWeatherInfo = getWeatherInfo;
module.exports.getAuto = getAuto;

async function getAuto(cityInput) {
    let autoUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${cityInput}&types=(cities)&key=AIzaSyDLxue5tDqrEqQ_vAeSkyrDJDXjZqknA-s`;
    console.log(autoUrl);
    let headers = {'Content': 'application/json'};
    let jsonFile = await fetch(autoUrl, {method: 'GET', headers: headers});
    let result = await jsonFile.json();
    return result;
}

async function getWeatherInfo(loc) {
    // lat=34.0522;
    // long=-118.2437;
    let url = `https://api.tomorrow.io/v4/timelines?location=${loc}&fields=${params}&timesteps=current,1h,1d&units=imperial&timezone=America/Los_Angeles&apikey=${tmr_key}`;
    console.log(url);
    // + lat + "," + long + '&fields=' + params + '&timesteps=current,1h,1d&units=imperial&timezone=America/Los_Angeles&apikey=' + tmr_api
    let headers = {'Content': 'application/json'};
    let jsonFile = await fetch(url, {method: 'GET', headers: headers});
    let result = await jsonFile.json();
    return result;
}

