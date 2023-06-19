import mapboxgl from 'mapbox-gl';
import overpassRussia from "./overpass-russia.txt";

window.addEventListener("load", () => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWxla3NlaS1hLXIiLCJhIjoiY2xpeWNkbDZ0MGd4bjNkbzFxYzZzOTRjaSJ9.OTXez9jXEokdDh5WEL8lIQ';
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v12', // style URL
        center: [30, 59], // starting position [lng, lat]
        zoom: 5 // starting zoom
    });

    const loadAndAddDataFromOverpassAPI = async () => {
        const api = await fetch('https://www.overpass-api.de/api/interpreter?', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: overpassRussia
        });
        const answer = await api.json();
        console.log(answer);

        const lines = {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: []
            }
        };

        for (let member of answer.elements[0].members) {
            if (member.geometry === undefined) {
                continue;
            }
            const feature = {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: [
                    ]
                }
            };
            const coords = feature.geometry.coordinates;

            for (let p of member.geometry) {
                coords.push([p.lon, p.lat])
            }
            lines.data.features.push(feature);
        }

        map.addSource('route2', lines);
        map.addLayer({
            'id': 'route2',
            'type': 'line',
            'source': 'route2',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': '#888',
                'line-width': 8
            }
        });


        const start = Date.now();
        function animate(timestamp) {
            const timeFromStart = Date.now() - start;
            const ss = timeFromStart / 1000.0;
            map.setPaintProperty(
                'route2',
                'line-color',
                `rgba(255, 128, 0, ${Math.cos(ss) * Math.cos(ss)})`
            );

            requestAnimationFrame(animate);
        }

        // start the animation
        animate(0);

    };

    map.on("load", () => {
        map.addLayer({
            'id': '3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
                'fill-extrusion-color': '#aaa',

                // use an 'interpolate' expression to add a smooth transition effect to the
                // buildings as the user zooms in
                'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'height']
                ],
                'fill-extrusion-base': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'min_height']
                ],
                'fill-extrusion-opacity': 0.6
            }
        });

        loadAndAddDataFromOverpassAPI();

    });
})