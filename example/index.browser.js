(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/kory/dev/terrace/example":[function(require,module,exports){
var terrace = require('../'),
    crel = require('crel');

var styles = crel('style');
styles.innerHTML = [
    'footer{position:fixed;bottom:0;left:0;right:0;height:30px; background:rgba(0,0,0,0.5);border:solid 1px red;}',
    'nav{position:fixed;bottom:0;top:0;right:0;width:30px; background:rgba(0,0,0,0.5);border:solid 1px red;}',
    'button{position:fixed;bottom:10px;right:10px;height:50px;width:50px;}'
].join('');

var footer = crel('footer'),
    floatingButton = crel('button'),
    nav = crel('nav');

terrace(footer, 0, {
    attach: ['left', 'right', 'bottom'],
    displace: ['above']
});

var navTerrace = terrace(nav, 1, {
    attach: ['right', 'bottom'], 
    displace: ['left']
});

terrace(floatingButton, 2, {
    attach: ['right', 'bottom']
});

window.addEventListener('load', function(){
    crel(document.body,
        styles,
        floatingButton,
        nav,
        footer
    );
});

window.navTerrace = navTerrace;
},{"../":"/home/kory/dev/terrace/index.js","crel":"/home/kory/dev/terrace/node_modules/crel/crel.js"}],"/home/kory/dev/terrace/index.js":[function(require,module,exports){
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
},{"css-translate":"/home/kory/dev/terrace/node_modules/css-translate/translate.js","laidout":"/usr/lib/node_modules/laidout/index.js","unitr":"/home/kory/dev/terrace/node_modules/unitr/unitr.js","venfix":"/home/kory/dev/terrace/node_modules/venfix/venfix.js"}],"/home/kory/dev/terrace/node_modules/crel/crel.js":[function(require,module,exports){
//Copyright (C) 2012 Kory Nunn

//Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

//The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/*

    This code is not formatted for readability, but rather run-speed and to assist compilers.

    However, the code's intention should be transparent.

    *** IE SUPPORT ***

    If you require this library to work in IE7, add the following after declaring crel.

    var testDiv = document.createElement('div'),
        testLabel = document.createElement('label');

    testDiv.setAttribute('class', 'a');
    testDiv['className'] !== 'a' ? crel.attrMap['class'] = 'className':undefined;
    testDiv.setAttribute('name','a');
    testDiv['name'] !== 'a' ? crel.attrMap['name'] = function(element, value){
        element.id = value;
    }:undefined;


    testLabel.setAttribute('for', 'a');
    testLabel['htmlFor'] !== 'a' ? crel.attrMap['for'] = 'htmlFor':undefined;



*/

(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.crel = factory();
    }
}(this, function () {
    var fn = 'function',
        obj = 'object',
        nodeType = 'nodeType',
        textContent = 'textContent',
        setAttribute = 'setAttribute',
        attrMapString = 'attrMap',
        isNodeString = 'isNode',
        isElementString = 'isElement',
        d = typeof document === obj ? document : {},
        isType = function(a, type){
            return typeof a === type;
        },
        isNode = typeof Node === fn ? function (object) {
            return object instanceof Node;
        } :
        // in IE <= 8 Node is an object, obviously..
        function(object){
            return object &&
                isType(object, obj) &&
                (nodeType in object) &&
                isType(object.ownerDocument,obj);
        },
        isElement = function (object) {
            return crel[isNodeString](object) && object[nodeType] === 1;
        },
        isArray = function(a){
            return a instanceof Array;
        },
        appendChild = function(element, child) {
          if(!crel[isNodeString](child)){
              child = d.createTextNode(child);
          }
          element.appendChild(child);
        };


    function crel(){
        var args = arguments, //Note: assigned to a variable to assist compilers. Saves about 40 bytes in closure compiler. Has negligable effect on performance.
            element = args[0],
            child,
            settings = args[1],
            childIndex = 2,
            argumentsLength = args.length,
            attributeMap = crel[attrMapString];

        element = crel[isElementString](element) ? element : d.createElement(element);
        // shortcut
        if(argumentsLength === 1){
            return element;
        }

        if(!isType(settings,obj) || crel[isNodeString](settings) || isArray(settings)) {
            --childIndex;
            settings = null;
        }

        // shortcut if there is only one child that is a string
        if((argumentsLength - childIndex) === 1 && isType(args[childIndex], 'string') && element[textContent] !== undefined){
            element[textContent] = args[childIndex];
        }else{
            for(; childIndex < argumentsLength; ++childIndex){
                child = args[childIndex];

                if(child == null){
                    continue;
                }

                if (isArray(child)) {
                  for (var i=0; i < child.length; ++i) {
                    appendChild(element, child[i]);
                  }
                } else {
                  appendChild(element, child);
                }
            }
        }

        for(var key in settings){
            if(!attributeMap[key]){
                element[setAttribute](key, settings[key]);
            }else{
                var attr = attributeMap[key];
                if(typeof attr === fn){
                    attr(element, settings[key]);
                }else{
                    element[setAttribute](attr, settings[key]);
                }
            }
        }

        return element;
    }

    // Used for mapping one kind of attribute to the supported version of that in bad browsers.
    crel[attrMapString] = {};

    crel[isElementString] = isElement;

    crel[isNodeString] = isNode;

    return crel;
}));

},{}],"/home/kory/dev/terrace/node_modules/css-translate/node_modules/unitr/unitr.js":[function(require,module,exports){
var parseRegex = /^(-?(?:\d+|\d+\.\d+|\.\d+))([^\.]*?)$/;

function parse(input){
    var valueParts = parseRegex.exec(input);

    if(!valueParts){
        return;
    }

    return {
        value: parseFloat(valueParts[1]),
        unit: valueParts[2]
    };
}

function addUnit(input, unit){
    var parsedInput = parse(input),
        parsedUnit = parse(unit);

    if(!parsedInput && parsedUnit){
        unit = input;
        parsedInput = parsedUnit;
    }

    if(!isNaN(unit)){
        unit = null;
    }

    if(!parsedInput){
        return input;
    }

    if(parsedInput.unit == null || parsedInput.unit == ''){
        parsedInput.unit = unit || 'px';
    }

    return parsedInput.value + parsedInput.unit;
};

module.exports = addUnit;
module.exports.parse = parse;
},{}],"/home/kory/dev/terrace/node_modules/css-translate/translate.js":[function(require,module,exports){
var unitr = require('unitr'),
    types = {
        '3d': '3d',
        'x': 'X',
        'y': 'Y',
        'z': 'Z',
        '2d': '',
        '': ''
    };

module.exports = function(type, x, y, z){
    if(!isNaN(type)){
        z = y;
        y = x;
        x = type;
        type = null;
    }

    type = type && type.toLowerCase() || '';

    var args = [];

    x != null && args.push(unitr(x));
    y != null && args.push(unitr(y));
    z != null && args.push(unitr(z));

    return 'translate' +
        types[type] +
        '(' +
        args.join(',') +
        ')';
}
},{"unitr":"/home/kory/dev/terrace/node_modules/css-translate/node_modules/unitr/unitr.js"}],"/home/kory/dev/terrace/node_modules/unitr/unitr.js":[function(require,module,exports){
var parseRegex = /^(-?(?:\d+|\d+\.\d+|\.\d+))([^\.]*?)$/;

function parse(input){
    var valueParts = parseRegex.exec(input);

    if(!valueParts){
        return;
    }

    return {
        value: parseFloat(valueParts[1]),
        unit: valueParts[2]
    };
}

function addUnit(input, unit){
    var parsedInput = parse(input),
        parsedUnit = parse(unit);

    if(!parsedInput && parsedUnit){
        unit = input;
        parsedInput = parsedUnit;
    }

    if(!isNaN(unit)){
        unit = null;
    }

    if(!parsedInput){
        return input;
    }

    if(parsedInput.unit == null || parsedInput.unit == ''){
        parsedInput.unit = unit || 'px';
    }

    return parsedInput.value + parsedInput.unit;
};

module.exports = addUnit;
module.exports.parse = parse;
},{}],"/home/kory/dev/terrace/node_modules/venfix/venfix.js":[function(require,module,exports){
var cache = {},
    bodyStyle = {};

if(typeof window !== 'undefined'){
    if(window.document.body){
        getBodyStyleProperties();
    }else{
        window.addEventListener('load', getBodyStyleProperties);
    }
}

function getBodyStyleProperties(){
    var shortcuts = {},
        items = document.defaultView.getComputedStyle(document.body);

    for(var i = 0; i < items.length; i++){
        bodyStyle[items[i]] = null;

        // This is kinda dodgy but it works.
        baseName = items[i].match(/^(\w+)-.*$/);
        if(baseName){
            if(shortcuts[baseName[1]]){
                bodyStyle[baseName[1]] = null;
            }else{
                shortcuts[baseName[1]] = true;
            }
        }
    }
}

function venfix(property, target){
    if(!target && cache[property]){
        return cache[property];
    }

    target = target || bodyStyle;

    var props = [];

    for(var key in target){
        cache[key] = key;
        props.push(key);
    }

    if(property in target){
        return property;
    }

    var propertyRegex = new RegExp('^(-(?:' + venfix.prefixes.join('|') + ')-)' + property + '(?:$|-)', 'i');

    for(var i = 0; i < props.length; i++) {
        var match = props[i].match(propertyRegex);
        if(match){
            var result = match[1] + property;
            if(target === bodyStyle){
                cache[property] = result
            }
            return result;
        }
    }

    return property;
}

// Add extensibility
venfix.prefixes = ['webkit', 'moz', 'ms', 'o'];

module.exports = venfix;
},{}],"/usr/lib/node_modules/laidout/index.js":[function(require,module,exports){
function checkElement(element){
    if(!element){
        return false;
    }
    var parentNode = element.parentNode;
    while(parentNode){
        if(parentNode === element.ownerDocument){
            return true;
        }
        parentNode = parentNode.parentNode;
    }
    return false;
}

module.exports = function laidout(element, callback){
    if(checkElement(element)){
        return callback();
    }

    var recheckElement = function(){
            if(checkElement(element)){
                document.removeEventListener('DOMNodeInserted', recheckElement);
                callback();
            }
        };

    document.addEventListener('DOMNodeInserted', recheckElement);
};
},{}]},{},["/home/kory/dev/terrace/example"]);
