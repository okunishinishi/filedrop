/**
 * captcha
 * @module tek-web/captcha
 */
var tek = require('tek'),
    copy = tek.meta.copy,
    random = Math.random,
    color = require('tek-web')['color'],
    rainbow = color.rainbow;


exports.defaultStyle = {
    width: 250,
    height: 120,
    baseColor: '#DD3030',
    backgroundColor: '#FFF',
    lineWidth: 8,
    fontSize: 80,
    fontFamily: 'sans'
};
exports.newBuffer = function (text, style, callback) {
    var Canvas = require('canvas')
    switch (arguments.length) {
        case 2:
            callback = arguments[1];
            style = {};
            break;
    }

    copy.fallback(exports.defaultStyle, style);

    var w = style.width,
        h = style.height;

    var canvas = new Canvas(w, h),
        ctx = canvas.getContext('2d');
    ctx.antialias = 'gray';
    ctx.fillStyle = style.backgroundColor;
    ctx.fillRect(0, 0, w, h);


    var colors = rainbow(style.baseColor, text.length).sort(function () {
        return random() - random();
    });

    ctx.font = [style.fontSize + 'px', style.fontFamily].join(' ');
    ctx.fillStyle = style.baseColor;
    var i;
    for (i = 0; i < 2; i++) {
        ctx.moveTo(20, random() * 150);
        ctx.bezierCurveTo(80, random() * 150, 160, random() * 150, 230, random() * 150);
        ctx.strokeStyle = colors[i % colors.length];
        ctx.stroke();
    }

    for (i = 0; i < text.length; i++) {
        ctx.fillStyle = colors[i];
        ctx.setTransform(
            random() * 0.5 + 1, random() * 0.4, random() * 0.4,
            random() * 0.5 + 1,
            style.fontSize * .5 * i+5, 100);
        ctx.fillText(text[i], 5, 0);
    }
    canvas.toBuffer(callback);
};

