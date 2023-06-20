//import mapboxgl from 'mapbox-gl';
import overpassStart from "./overpass-start.txt"
import overpassEnd from "./overpass-end.txt"

export async function addCountryContour(countryName, color) {
    if (window.map.getLayer(countryName) != undefined) {
        window.map.setPaintProperty(countryName,  'line-color', color);
        return;
    }
    const api = await fetch('https://www.overpass-api.de/api/interpreter?', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: overpassStart + countryName + overpassEnd
    });
    const answer = await api.json();
    
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
    window.map.addSource(countryName, lines);
    window.map.addLayer({
        'id': countryName,
        'type': 'line',
        'source': countryName,
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-width': 6,
            'line-color': color,
        }
    });
}