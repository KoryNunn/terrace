var laidout = require('laidout'),
    unitr = require('unitr');

var layers;

function getPosition(element){
    var rect = element.getBoundingClientRect();
    return {
        top: rect.top,
        left: rect.left,
        bottom: window.innerHeight - rect.bottom,
        right: window.innerWidth - rect.right
    };
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
        if(!document.contains(element) || window.getComputedStyle(element).display === 'none'){
            settings.hidden = true;
            element.style.top = null;
            element.style.bottom = null;
            element.style.left = null;
            element.style.right = null;
            return;
        }

        if(settings.hidden){
            settings.position = getPosition(element);
        }

        settings.hidden = false;

        var currentRect = element.getBoundingClientRect(),
            top = settings.position.top + previousLayerBounds.top,
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
            if(~settings.displace.indexOf('below')){
                bounds.top = Math.max(bounds.top, top + currentRect.height);
            }
            if(~settings.displace.indexOf('above')){
                bounds.bottom = Math.max(bounds.bottom, bottom + currentRect.height);
            }
            if(~settings.displace.indexOf('right')){
                bounds.left = Math.max(bounds.left, left + currentRect.width);
            }
            if(~settings.displace.indexOf('left')){
                bounds.right = Math.max(bounds.right, right + currentRect.width);
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

    if(!layers[layer]){
        layer = layers[layerIndex] = {
            elements: [],
            settings: []
        };
    }

    var layerIndex = layer.elements.indexOf(element);

    if(~layerIndex){
        layer.settings[layerIndex] = settings;
        return;
    }else{
        layer.elements.push(element);
        layer.settings.push(settings);
    }

    if(!settings.position){
        laidout(element, function(){
            settings.position = getPosition(element);
        });
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