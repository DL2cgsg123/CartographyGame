import mapboxgl from 'mapbox-gl';
import {countryList} from './countries.js'
import {addCountryContour} from './drawing.js'
import {convertionCountries} from './countries_convertion.js'

const stateStart = 0;
const stateWaitForAnsw = 1;
const stateWin = 2;
const stateLose = 3;

export class player {
    constructor() {
        this.state = stateStart;
        this.score = 0;
        this.prevCountriesList = [];
        this.answNum = 0;
    }

    #getRandCountry() {
        return countryList[Math.floor(Math.random() * countryList.length)];
    }

    waitForAnsw(e) {
        if (this.state != stateWaitForAnsw)
            return;
        var features = window.map.queryRenderedFeatures(e.point, { layers: ['states-layer'] });
        if (!features.length) {
            return;
        }
        console.log("Your current answer: " + features[0].properties.name);

        let color;
        if (features[0].properties.iso_a2 === this.curCountry) {
            this.state = stateWin;
            color = "rgba(0, 255, 0, 1)";
            addCountryContour(features[0].properties.name, color);
            this.prevCountriesList.push(features[0].properties.name);
            this.connect();
            return;
        }
        else {
            new mapboxgl.Popup({ closeOnClick: false })
                .setLngLat(e.lngLat)
                .setHTML(features[0].properties.name)
                .addTo(window.map);
            if (this.answNum >= 2) {
                this.state = stateLose;
                this.connect();
                return; // fix
            }
            else
                this.answNum++;
            this.prevCountriesList.push(features[0].properties.name);
            color = "rgba(255, 0, 0, 1)";
        }
        addCountryContour(features[0].properties.name, color);//, true);
    }

    connect() {
        switch (this.state) {
            case stateStart:
                this.curCountry = this.#getRandCountry();
                console.log("Your new task: " + convertionCountries[this.curCountry]); // add render  
                this.state = stateWaitForAnsw;
                window.map.on('click', (e) => {this.waitForAnsw(e)});
                return;
            case stateLose:
                console.log("You lose :(((("); // add render
                this.prevCountriesList.forEach((countryName) => {
                    window.map.setPaintProperty(countryName, 'line-color', "rgba(0, 0, 0, 0)");
                });
                this.curCountry = undefined;
                this.prevCountriesList = [];
                this.answNum = 0;
                this.state = stateStart;
                window.map.on('click', null);
                this.connect();
                return;
            case stateWin:
                console.log("You win !!! :)))"); // add render
                this.prevCountriesList.forEach((countryName) => {
                    window.map.setPaintProperty(countryName, 'line-color', "rgba(0, 0, 0, 0)");
                });
                this.curCountry = undefined;
                this.prevCountriesList = [];
                this.answNum = 0;
                this.state = stateStart;
                this.score++; // ?
                window.map.on('click', null);
                this.connect();
                return;
        }
    }
}

// !!! ISO3166-1:alpha2