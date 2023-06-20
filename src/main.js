import mapboxgl from 'mapbox-gl';
import {player} from './logic.js'
/*
import {addCountryContour} from "./drawing.js"
import overpassStart from "./overpass-start.txt"
import overpassEnd from "./overpass-end.txt"
*/

window.addEventListener("load", () => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWxla3NlaS1hLXIiLCJhIjoiY2xpeWNkbDZ0MGd4bjNkbzFxYzZzOTRjaSJ9.OTXez9jXEokdDh5WEL8lIQ';
    window.map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v12', // style URL
        center: [30, 59], // starting position [lng, lat]
        zoom: 5, // starting zoom
        minzoom: 4.2,
    });

    window.map.on("load", () => {    
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
        window.map.style.stylesheet.layers.forEach(function(layer) {
            if (layer.type === 'symbol') {
                window.map.setLayoutProperty(layer.id, "visibility", "none");
            }
        });

        window.player = new player();
        window.player.connect();
    });

    //let lastLayerName;
    /*
    window.map.on('click', (e) => {
        var features = window.map.queryRenderedFeatures(e.point, { layers: ['states-layer'] });
        if (!features.length) {
            return;
        }
        console.log(features[0].properties.name);

        if (lastLayerName != undefined)
            window.map.setPaintProperty(lastLayerName, 'line-color', "rgba(0, 0, 0, 0)");
        addCountryContour(features[0].properties.name, "rgba(0, 255, 0, 1)");
        lastLayerName = features[0].properties.name;
    });
    */
})