# terrace

automatically layout fixed UI elements based on layers.

## Usage

var terrace = require('terrace');

var navTerrace = terrace(someElement, layerIndex, {
    attach: ['right', 'bottom'], // what sides of the screen it is attached to
    displace: ['left'], // in what directions does it displace higher layers
    retract: ['bottom'] // From what direction should the element reduce in size if it would excape its layer.
});

## Position

Modify the position of a terrace piece after it has been initialised

    navTerrace.position({
        top: 20
    });

or

    navTerrace.position({
        top: 20,
        left: 30
    });

etc...

## Destroy

When done, you should destroy terrace pieces.

    navTerrace.destroy();