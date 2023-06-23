import mapboxgl from 'mapbox-gl';
import {player, get_leaders} from './logic.js'

import $ from 'jquery'

window.addEventListener("load", () => {
    $(location).attr('href', "#");
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWxla3NlaS1hLXIiLCJhIjoiY2xpeWNkbDZ0MGd4bjNkbzFxYzZzOTRjaSJ9.OTXez9jXEokdDh5WEL8lIQ';
    window.map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v12', // style URL
        center: [19.353150126328785, 49.5382110117873], // starting position [lng, lat]
        zoom: 1.72, // starting zoom
    });

    window.map.on("load", () => { 
        window.map.style.stylesheet.layers.forEach(function(layer) {
            if (layer.type === 'symbol') {
                window.map.setLayoutProperty(layer.id, "visibility", "none");
            }
        });
        window.map.addSource('states', {
            'type': 'geojson',
            'data': 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson'
        });

        window.map.addLayer({
            'id': 'states-layer',
            'type': 'fill',
            'source': 'states',
            'paint': {
                'fill-color': 'rgba(0, 0, 0, 0)',
                'fill-outline-color': 'rgba(0, 0, 0, 0)'
            }
        });

        window.player = new player();
        document.getElementById('score-text').innerHTML = "Score: 0";
        document.getElementById('score').style.visibility = "visible";
        document.getElementById('space').style.visibility = "visible";
         /*
        let newPlayer = {
            name: "A",
            score: 447,
        };
        submit_player(newPlayer);
        */
       get_leaders();
       window.player.connect();
       /*
       get_leaders().then((text) => {
        console.log("AAA" + text);
       });
        get_leaders().then((res) =>{
            leadersData = tmp.split(';');
        leadersData.forEach((leaderData, ind) => {
            let leader = document.getElementById("leader" + (ind + 1));
            let data = leaderData.split(':');
            leader.innerHTML = data[0] + ': ' + data[1];
        });
        }),
        */
    });
})

/*
let newPlayer = {
    name: "CGSG",
    score: 102,
};

submit_player(newPlayer);
*/
//get_leaders();