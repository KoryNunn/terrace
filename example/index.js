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
    attach: ['right', 'bottom', 'top'], 
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