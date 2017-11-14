(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var terrace = require('../'),
    crel = require('crel');

var styles = crel('style');
styles.innerHTML = [
    'html{font-size:18px;font-family:Arial;}',
    'footer{position:fixed;bottom:0;left:0;right:0;height:30px; background:rgba(0,0,0,0.5);border:solid 1px red;}',
    'nav{display: none; position:fixed;bottom:0;top:0;right:0;width:30px; background:rgba(0,0,0,0.5);border:solid 1px red;}',
    'button{position:fixed;bottom:10px;margin-right:10px;margin-bottom:10px;height:50px;width:150px;}',
    '.menu{position:absolute;top:60%;margin:10px;min-height:100px;min-width:150px;background:green;overflow-y:auto;}',
    '.menu .item{border: solid 1px black;}'
].join('');

var footer = crel('footer', 'A footer, perchance?'),
    floatingButton = crel('button', 'Commence!'),
    nav = crel('nav', 'Navigate laterally'),
    menu = crel('div', { class: 'menu' },
        crel('h3', 'Some menu that has items'),
        Array.apply(null, { length: 10 }).map((item, index) =>
            crel('div', { class: 'item' }, index)
        )
    );

function animate(){
    footer.style.height = String(Math.sin(Date.now() / 1000) * 100 + 100) + 'px';
    nav.style.width = String(Math.sin(Date.now() / 3000) * 50 + 50) + 'px';
    nav.style.display = Math.sin(Date.now() / 1000) > 0 ? 'initial' : 'none';
    menu.style.top = String(Math.sin(Date.now() / 3000) * 10 + 70) + '%';
    menu.style.left = String(Math.sin(Date.now() / 3000) * 50 + 40) + '%';
    requestAnimationFrame(animate);
}
animate();

terrace(footer, 0, {
    attach: ['left', 'right', 'bottom'],
    displace: ['above']
});

var navTerrace = terrace(nav, 1, {
    attach: ['right', 'bottom', 'top'],
    displace: ['left']
});

terrace(floatingButton, 2, {
    attach: ['right', 'bottom'],
    displace: ['left']
});

terrace(menu, 3, {
    autoPosition: true,
    retract: ['bottom', 'right']
});

window.addEventListener('load', function(){
    crel(document.body,
        styles,
        menu,
        floatingButton,
        nav,
        footer
    );
});
},{"../":2,"crel":3}],2:[function(require,module,exports){
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

function retract(side, element, settings, previousLayerBounds){
    if(settings.position[side] < previousLayerBounds[side]){
        element.style[side] = unitr(previousLayerBounds[side]);
    }else{
        element.style[side] = null;
    }
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

        if(settings.retract){
            var retractTop = ~settings.retract.indexOf('top');
            var retractBottom = ~settings.retract.indexOf('bottom');
            var retractLeft = ~settings.retract.indexOf('left');
            var retractRight = ~settings.retract.indexOf('right');

            retractTop && (element.style.top = null);
            retractBottom && (element.style.bottom = null);
            retractLeft && (element.style.left = null);
            retractRight && (element.style.right = null);
            settings.position = getPosition(element.getBoundingClientRect());

            if(retractTop){
                retract('top', element, settings, previousLayerBounds);
            }
            if(retractBottom){
                retract('bottom', element, settings, previousLayerBounds);
            }
            if(retractLeft){
                retract('left', element, settings, previousLayerBounds);
            }
            if(retractRight){
                retract('right', element, settings, previousLayerBounds);
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

    var elementIndex = layer.elements.indexOf(element);

    if(~elementIndex){
        layer.settings[elementIndex] = settings;
        return;
    }else{
        layer.elements.push(element);
        layer.settings.push(settings);
    }

    return {
        destroy: function(){
            var elementIndex = layer.elements.indexOf(element);
            layer.elements.splice(elementIndex, 1);
            layer.settings.splice(elementIndex, 1);
        },
        position: function(position){
            for(var key in position){
                settings.position[key] = position[key];
            }
        }
    };
}

module.exports = terrace;

},{"outer-dimensions":5,"positioned":6,"unitr":7}],3:[function(require,module,exports){
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
                if(isType(settings[key],fn)){
                    element[key] = settings[key];
                }else{
                    element[setAttribute](key, settings[key]);
                }
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

    if(typeof Proxy !== 'undefined'){
        return new Proxy(crel, {
            get: function(target, key){
                !(key in crel) && (crel[key] = crel.bind(null, key));
                return crel[key];
            }
        });
    }

    return crel;
}));

},{}],4:[function(require,module,exports){
function checkElement(element, checkDisplay){
    if(!element){
        return false;
    }
    var parentNode = element;
    while(parentNode){
        if(checkDisplay && parentNode.style && parentNode.style.display === 'none'){
            return false;
        }
        if(parentNode === element.ownerDocument){
            return true;
        }
        parentNode = parentNode.parentNode;
    }
    return false;
}

module.exports = function laidout(element, checkDisplay, callback){
    if(arguments.length < 3){
        callback = checkDisplay;
        checkDisplay = false;
    }

    if(checkElement(element, checkDisplay)){
        return callback();
    }

    var recheckElement = function(){
            if(checkElement(element, checkDisplay)){
                document.removeEventListener('DOMNodeInserted', recheckElement);
                callback();
                return;
            }

            if(checkDisplay){
                requestAnimationFrame(recheckElement);
            }
        };

    recheckElement();
    document.addEventListener('DOMNodeInserted', recheckElement);
};
},{}],5:[function(require,module,exports){
module.exports = function outerDimensions(element) {
    if(!element) {
        return;
    }

    var dimensions = {
            height: element.offsetHeight,
            width: element.offsetWidth
        },
        style = window.getComputedStyle(element);

    dimensions.height += parseInt(style.marginTop) + parseInt(style.marginBottom);
    dimensions.width += parseInt(style.marginLeft) + parseInt(style.marginRight);

  return dimensions;
};
},{}],6:[function(require,module,exports){
var laidout = require('laidout'),
    positionChecks = [],
    running;

function checkPosition(positionCheck, index){
    var rect = positionCheck.element.getBoundingClientRect();

    if(rect.top || rect.bottom || rect.left || rect.right) {
        positionChecks.splice(index, 1);
        positionCheck.callback();
    }
}

function run(){
    running = true;

    positionChecks.forEach(checkPosition);

    if(!positionChecks.length) {
        running = false;

        return;
    }

    requestAnimationFrame(run);
}

module.exports = function hasPosition(element, callback){
    laidout(element, function(){
        positionChecks.push({
            element: element,
            callback: callback
        });

        if(!running){
            run();
        }
    });
};

},{"laidout":4}],7:[function(require,module,exports){
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
},{}]},{},[1]);
