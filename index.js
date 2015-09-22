var unitr = require('unitr'),
    positioned = require('positioned'),
    outerDimensions = require('outer-dimensions');

var layers;

function getPosition(rect){
    return {
        top: rect.top,
        left: rect.left,
        bottom: window.innerHeight - rect.bottom,
        right: window.innerWidth - rect.right
    };
}


function scheduleGetPosition(element, callback){
    positioned(element, function setPosition(){
        callback(getPosition(element.getBoundingClientRect()));
    });
}

function updateLayer(layer, previousLayerBounds){
    var bounds = layer.bounds;

    if(!bounds){
        bounds = layer.bounds = {};
    }

    bounds.top = previousLayerBounds.top;
    bounds.left = previousLayerBounds.left;
    bounds.bottom = previousLayerBounds.bottom;
    bounds.right = previousLayerBounds.right;

    layer.elements.forEach(function(element, index){
        var settings = layer.settings[index];

        if(!document.contains(element)){
            settings.hidden = true;
            element.style.top = null;
            element.style.bottom = null;
            element.style.left = null;
            element.style.right = null;
            return;
        }

        if(settings.autoPosition && settings.hidden && !settings.gettingPosition){
            settings.gettingPosition = true;
            scheduleGetPosition(element, function(position){
                settings.position = position;
                settings.hidden = false;
            });
            return;
        }

        settings.hidden = false;

        var top = settings.position.top + previousLayerBounds.top,
            bottom = previousLayerBounds.bottom + settings.position.bottom,
            left = settings.position.left + previousLayerBounds.left,
            right = previousLayerBounds.right + settings.position.right;

        if(settings.attach){
            if(~settings.attach.indexOf('top')){
                element.style.top = unitr(top);
            }
            if(~settings.attach.indexOf('bottom')){
                element.style.bottom = unitr(bottom);
            }
            if(~settings.attach.indexOf('left')){
                element.style.left = unitr(left);
            }
            if(~settings.attach.indexOf('right')){
                element.style.right = unitr(right);
            }
        }

        if(settings.displace){
            var dimensions = outerDimensions(element);

            if(~settings.displace.indexOf('below')){
                bounds.top = Math.max(bounds.top, top + dimensions.height);
            }
            if(~settings.displace.indexOf('above')){
                bounds.bottom = Math.max(bounds.bottom, bottom + dimensions.height);
            }
            if(~settings.displace.indexOf('right')){
                bounds.left = Math.max(bounds.left, left + dimensions.width);
            }
            if(~settings.displace.indexOf('left')){
                bounds.right = Math.max(bounds.right, right + dimensions.width);
            }
        }

    });
}

function update(){

    var lastLayerBounds = {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    };

    var keys = Object.keys(layers).sort();

    keys.forEach(function(key){
        updateLayer(layers[key], lastLayerBounds);
        lastLayerBounds = layers[key].bounds;
    });

    requestAnimationFrame(update);
}

function setup(){
    if(layers){
        return;
    }

    layers = {};

    update();
}

function terrace(element, layerIndex, settings){
    var layer;

    if(!settings || typeof settings !== 'object'){
        throw 'terrace settings are required and must be an object';
    }

    setup();

    layer = layers[layerIndex];

    settings.hidden = true;
    settings.position = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    };

    if(!layers[layer]){
        layer = layers[layerIndex] = {
            elements: [],
            settings: []
        };
    }

    layerIndex = layer.elements.indexOf(element);

    if(~layerIndex){
        layer.settings[layerIndex] = settings;
        return;
    }else{
        layer.elements.push(element);
        layer.settings.push(settings);
    }

    return {
        destroy: function(){
            var layerIndex = layer.elements.indexOf(element);
            layer.elements.splice(layerIndex, 1);
            layer.settings.splice(layerIndex, 1);
        },
        position: function(position){
            for(var key in position){
                settings.position[key] = position[key];
            }
        }
    };
}

module.exports = terrace;
