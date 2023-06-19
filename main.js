const Deck = require('@deck.gl/core');
const ScatterplotLayer = require('@deck.gl/layers');

const INITIAL_VIEW_STATE = {
  latitude: 37.8,
  longitude: -122.45,
  zoom: 15
};

window.deckgl = new Deck({
    initialViewState: INITIAL_VIEW_STATE,
    controller: true,
    layers: [
    new ScatterplotLayer({
        data: [
        {position: [-122.45, 37.8], color: [255, 0, 0], radius: 100}
        ],
        getColor: d => d.color,
        getRadius: d => d.radius
    })
    ]
});


