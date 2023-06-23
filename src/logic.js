import mapboxgl from 'mapbox-gl';
import {countryList} from './countries.js'
import {addCountryContour} from './drawing.js'
import {convertionCountries} from './countries_convertion.js'
import {countriesScore} from './score.js'
import $ from 'jquery'

const stateStart = 0;
const stateWaitForAnsw = 1;
const stateWin = 2;
const stateLose = 3;

function submit_player(Player) {
    console.log("Start");
    
    /*fetch('/', {
        method: 'POST',
        body: Player.name + ':' + Player.score,
    });*/

    let headers = new Headers()
    headers.append("Content-Type", "application/json")

    let body = JSON.stringify({
        name: Player.name,
        score: Player.score
    });

    fetch('/leader-name', {
        method: "POST",
        headers,
        body
    })
}

function parseLeaders(data) {
    let leaders = []
    let j = 0, k = 0, oldj = 0;
    for (let i = 0; i < 3; i++) {
        while (j < data.length && data[j] != ':')
            j++;
        while (k < data.length && data[k] != ';')
            k++;
        let name = data.substr(oldj, j - oldj);
        let score = data.substr(j + 1, k - j - 1);
        let leader = {
            name: name,
            score: score,
        }
        leaders[i] = leader;
        k++;
        j = k;
        oldj = k;
    }
    return leaders;
}

export async function get_leaders() {
    fetch('/a', {
        method: 'GET'
    })
        .then(response => {
            return response.text();
        })
        .then(text => {
            let leaders = parseLeaders(text);
            document.getElementById('leader1').innerHTML = "1. " + leaders[0].name + ": " + leaders[0].score;
            document.getElementById('leader2').innerHTML = "2. " + leaders[1].name + ": " + leaders[1].score;
            document.getElementById('leader3').innerHTML = "3. " + leaders[2].name + ": " + leaders[2].score;
            console.log(text);
        });
}

export class player {
    constructor() {
        this.state = stateStart;
        this.score = 0;
        this.prevCountriesList = [];
        this.answNum = 0;
        this.unguessedCountries = countryList.slice();
        this.name = undefined;
    }

    #getRandCountry() {
        if (!this.unguessedCountries || this.unguessedCountries.length < 1)
            return undefined;
        return this.unguessedCountries[Math.floor(Math.random() * this.unguessedCountries.length)];
    }

    waitForAnsw(e) {
        get_leaders();
        if (this.state != stateWaitForAnsw)
            return;
        var features = window.map.queryRenderedFeatures(e.point, { layers: ['states-layer'] });
        if (!features.length) {
            return;
        }
        let color;
        if (features[0].properties.iso_a2 === this.curCountry) {
            color = "rgba(0, 255, 0, 0.6)";
            addCountryContour(features[0].properties.iso_a2, color).then(() => {
                this.state = stateWin;
                this.prevCountriesList.push(features[0].properties.iso_a2);
                this.unguessedCountries.splice(this.unguessedCountries.indexOf(this.curCountry), 1);
                this.connect();
                return;
            });
        }
        else {
            color = "rgba(255, 0, 0, 0.6)";
            if (this.prevCountriesList.indexOf(features[0].properties.iso_a2) != -1)
                return;
            addCountryContour(features[0].properties.iso_a2, color).then(() => {
                new mapboxgl.Popup({  closeOnClick: false, className: "popup" })
                .setLngLat(e.lngLat)
                //.setHTML('<h3 style="font-family: `Fira Sans`, sans-serif;font-family: `Kanit`, sans-serif;color=#2f6c2f">' + features[0].properties.name + '</h3>')   
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

    #addWindow(text){
        let curWindow = $('#window');
        if (curWindow.children().length)
        curWindow.empty(); 
        //let text = isWin ?  : "You lose";
        //curWindow.append($(`<p id="window_lose_text">` + text + `</p>`));
        //$('#darc').onclick = () => {$('#window').empty(); $(location).attr('href', '#')};
        curWindow.append($(`<a href="#" class="close"></a><p id="window_lose_text">` + text + `</p>`));
        $(location).attr('href', "#dark");
    }

    #addInput() {
        let curWindow = $('#window');
        curWindow.append($(`<input type="text" id="name">`));
        document.onkeyup = function (e) {
            if (e.keyCode == 13) {
                window.player.name = document.getElementById('name').value;
                window.player.leaderData = {
                    name: window.player.name,
                    score: window.player.score,
                };
                submit_player(window.player.leaderData);
                get_leaders();
            }
        }
    }

    #getLeadersScore() {
        let res = [];
        for (let i = 1; i <= 3; i++) {
            let data = document.getElementById('leader' + i).innerHTML.split(' ');
            if (data == undefined || data.length < 1)
                res.push(0);
            else
                res.push(data[data.length - 1]);
        }
        return res;
    }

    connect() {
        let data;
        let newPlayer1 = {
            name: "CGSG",
            score: 102,
        };
        let newPlayer = {
            name: "DL2",
            score: 10,
        };
        let newPlayer2 = {
            name: "ES1A",
            score: 47,
        };
        
        //submit_player(newPlayer2);
        get_leaders();
        switch (this.state) {
            case stateStart:
                /*
                this.#addWindow("&#9733;You are the new leader!&#9733;<br>Input your name:");
                this.#addInput();
                */
                get_leaders();
                /*
                this.#addWindow("&#9733;You are the new leader!&#9733;<br>Input your name:");
                this.#addInput();
                */
                this.curCountry = this.#getRandCountry();
                if (this.curCountry == undefined) {
                    this.#addWindow("That's All!Your final score: " + this.score);
                    return;
                }
                document.getElementById('country').innerHTML = "Task: " + convertionCountries[this.curCountry];
                if (document.getElementById('menu').style.visibility === "hidden")
                document.getElementById('menu').style.visibility = 'visible';
                this.state = stateWaitForAnsw;
                window.map.on('click', (e) => {this.waitForAnsw(e)});
                //console.log(get_leaders());
                return;
            case stateLose:
                get_leaders();
                setTimeout(this.#clearPrevCountries, 2500, this.prevCountriesList);
                this.curCountry = undefined;
                this.prevCountriesList = [];
                this.answNum = 0;
                this.state = stateStart;
                window.map.on('click', null);
                this.#addWindow("You lose");
                this.connect();
                return;
            case stateWin:                
                get_leaders();
                setTimeout(this.#clearPrevCountries, 3000, this.prevCountriesList);
                this.prevCountriesList = [];
                this.answNum = 0;
                this.state = stateStart;
                this.score += countriesScore[this.curCountry];
                document.getElementById('score-text').innerHTML = "Score: " + this.score;
                this.curCountry = undefined;
                window.map.on('click', null);
                data = this.#getLeadersScore();
                if (this.score > data[data.length - 1]) {
                    if (this.name == undefined) {
                        this.#addWindow("&#9733;You are the new leader!&#9733;<br>Input your name:");
                        this.#addInput();
                    }
                    else {
                        this.leaderData.score = this.score;
                        submit_player(this.leaderData);
                        get_leaders();
                    }
                }
                else
                    this.#addWindow("&#9733;You win!&#9733;");
                this.connect();
                return;
        }
    }
}
