import {countryList} from './countries.js'
import {addCountryContour} from './drawing.js'

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
        if (features[0].properties.name === this.curCountry) {
            this.state = stateWin;
            this.connect();
            this.prevCountriesList.push(features[0].properties.name);
            color = "rgba(0, 255, 0, 1)";
        }
        else
        {
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
        addCountryContour(features[0].properties.name, color);
    }

    connect() {
        switch (this.state) {
            case stateStart:
                this.curCountry = this.#getRandCountry();
                console.log("Your new task: " + this.curCountry); // add render
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
                this.prevCountriesList.array.forEach(countryName => {
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