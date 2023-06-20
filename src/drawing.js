//import mapboxgl from 'mapbox-gl';
import overpassStart from "./overpass-start.txt"
import overpassEnd from "./overpass-end.txt"
//import turf from 'turf'

export async function addCountryContour(countryName, color) {//, labelsFlag) {
    if (window.map.getLayer(countryName) != undefined) {
        window.map.setPaintProperty(countryName,  'line-color', color); // !!! lable
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


    map.addSource(countryName + 'Text', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': [{
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [LonSum / Pn, LatSum / Pn]
                }
            }]
        }
    });

    /*
    window.map.addLayer({
        'id': countryName + "Text",
        'type': 'symbol',
        'source': countryName + 'Text',
        'layout': {
            //'symbol-placement': 'line-center',
            'text-field': 'AAAAAAAAAAAAAA',
            //'text-justify': 'center',
            //'text-anchor': 'center',
            //'text-size': 20,
        },
        'paint': {
            'text-color': '#888',
        }
    });
    */
}