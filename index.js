var laidout = require('laidout'),
    venfix  =require('venfix'),
    translate = require('css-translate'),
    unitr = require('unitr');

var layers;

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
        if(!document.contains(element)){
            return;
        }

        var settings = layer.settings[index],
            currentRect = element.getBoundingClientRect(),
            top = settings.position.top + previousLayerBounds.top,
            bottom = previousLayerBounds.bottom + settings.position.bottom,
            left = settings.position.left + previousLayerBounds.left,
            right = previousLayerBounds.right + settings.position.right;

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

        if(!settings.displace){
            return;
        }

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

    });
}

function update(){

    var lastLayerBounds = {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    };

    for(var key in layers){
        updateLayer(layers[key], lastLayerBounds);
        lastLayerBounds = layers[key].bounds;
    }

    requestAnimationFrame(update);
}

function setup(){
    if(layers){
        return;
    }

    layers = {};

    update();
}

function buildAttachment(attachments){
    attachments = attachments.split(' ');

    var attachment = {};

    if(~attachments.indexOf('top')){
        attachment.top = null;
    }
    if(~attachments.indexOf('right')){
        attachment.right = null;
    }
    if(~attachments.indexOf('bottom')){
        attachment.bottom = null;
    }
    if(~attachments.indexOf('left')){
        attachment.left = null;
    }

    return attachment;
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
            var rect = element.getBoundingClientRect();
            settings.position = {
                top: rect.top,
                left: rect.left,
                bottom: window.innerHeight - rect.bottom,
                right: window.innerWidth - rect.right, 
                width: rect.width,
                height: rect.height
            };
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