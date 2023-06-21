import mapboxgl from 'mapbox-gl';
import {countryList} from './countries.js'
import {addCountryContour} from './drawing.js'
import {convertionCountries} from './countries_convertion.js'
import {countriesScore} from './score.js'

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
        this.unguessedCountries = countryList.slice();
    }

    #getRandCountry() {
        return this.unguessedCountries[Math.floor(Math.random() * this.unguessedCountries.length)];
    }

    waitForAnsw(e) {
        if (this.state != stateWaitForAnsw)
            return;
        var features = window.map.queryRenderedFeatures(e.point, { layers: ['states-layer'] });
        if (!features.length) {
            return;
        }
        if (convertionCountries[features[0].properties.iso_a2] == undefined)
            console.log("Your current answer: " + features[0].properties.name)
        else
            console.log("Your current answer: " + convertionCountries[features[0].properties.iso_a2]);

        let color;
        if (features[0].properties.iso_a2 === this.curCountry) {
            color = "rgba(0, 255, 0, 1)";
            addCountryContour(features[0].properties.iso_a2, color).then(() => {
                this.state = stateWin;
                this.prevCountriesList.push(features[0].properties.iso_a2);
                this.unguessedCountries.splice(this.unguessedCountries.indexOf(this.curCountry), 1);
                this.connect();
                return;
            });
        }
        else {
            color = "rgba(255, 0, 0, 1)";
            if (this.prevCountriesList.indexOf(features[0].properties.iso_a2) != -1)
                return;
            addCountryContour(features[0].properties.iso_a2, color).then(() => {
                new mapboxgl.Popup({ closeOnClick: false })
                .setLngLat(e.lngLat)
                .setHTML(features[0].properties.name)   
                .addTo(window.map);
                this.prevCountriesList.push(features[0].properties.iso_a2);    
                if (this.answNum >= 2) {
                    this.state = stateLose;
                    this.unguessedCountries.splice(this.unguessedCountries.indexOf(this.curCountry), 1);
                    this.connect();
                    return;
                }
                else
                    this.answNum++;
            });
        }
    }

    #clearPrevCountries(prevCountriesList) {
        prevCountriesList.forEach((countryNameISOA2) => {
            window.map.setLayoutProperty(countryNameISOA2, 'visibility', 'none');
        });
    }

    connect() {
        switch (this.state) {
            case stateStart:
                this.curCountry = this.#getRandCountry();
                document.getElementById('country').innerHTML = "Task: " + convertionCountries[this.curCountry];
                if (document.getElementById('country').style.visibility === "hidden")
                    document.getElementById('country').style.visibility = 'visible';
                this.state = stateWaitForAnsw;
                window.map.on('click', (e) => {this.waitForAnsw(e)});
                return;
            case stateLose:
                console.log("You lose :(((("); // add render
                setTimeout(this.#clearPrevCountries, 2500, this.prevCountriesList);
                this.curCountry = undefined;
                this.prevCountriesList = [];
                this.answNum = 0;
                this.state = stateStart;
                window.map.on('click', null);
                this.connect();
                return;
            case stateWin:
                console.log("You win !!! :)))"); // add render
                setTimeout(this.#clearPrevCountries, 3000, this.prevCountriesList);
                this.prevCountriesList = [];
                this.answNum = 0;
                this.state = stateStart;
                this.score += countriesScore[this.curCountry];
                console.log("!!Your score: " + this.score);
                this.curCountry = undefined;
                window.map.on('click', null);
                this.connect();
                return;
        }
    }
}

// !!! ISO3166-1:alpha2