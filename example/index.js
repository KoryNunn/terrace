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
    menu.style.left = String(Math.sin(Date.now() / 3000) * 40 + 40) + '%';
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