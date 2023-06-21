import overpassStart from "./overpass-start.txt"
import overpassEnd from "./overpass-end.txt"

export async function addCountryContour(countryNameISOA2, color) {
    if (window.map.getLayer(countryNameISOA2) != undefined) {
        window.map.setPaintProperty(countryNameISOA2,  'line-color', color);
        window.map.setLayoutProperty(countryNameISOA2, 'visibility', 'visible');
        return;
    }
    const api = await fetch('https://www.overpass-api.de/api/interpreter?', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: overpassStart + countryNameISOA2 + overpassEnd
    });
    const answer = await api.json();
    
    const lines = {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        },
    };
    let Pn = 0;
    let LonSum = 0.0, LatSum = 0.0;

    for (let member of answer.elements[0].members) {
        if (member.geometry === undefined) {
            continue;
        }
        const feature = {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [
                ]
            }
        };
        const coords = feature.geometry.coordinates;
        
        for (let p of member.geometry) {
            coords.push([p.lon, p.lat])
            Pn++;
            LonSum += p.lon;
            LatSum += p.lat;
        }
        lines.data.features.push(feature);
    }
    window.map.addSource(countryNameISOA2, lines); 
    let pr = await window.map.addLayer({
        'id': countryNameISOA2,
        'type': 'line',
        'source': countryNameISOA2,
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-width': 6,
            'line-color': color,
        }
    });
    return pr;
}