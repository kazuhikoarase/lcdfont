//
// matrix-digital-rain
//
// Copyright (c) 2016 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//

var matrixDigitalRain = function() {

  'use strict';

  var createWorld = function(opts) {

    opts = $.extend({
      loColor : 'rgba(0,255,127,1)',
      hiColor : 'rgba(159,255,191,1)',
      message : '',
      messageRate : 0.01,
      getSize : function() {
        return { width : 100, height : 100 };
      }
    }, opts);

    var sizeChanged = function() {
      $cv.attr({ width : width, height : height });
      maxDrops = ~~(width * height / 1000);
      maxDropsPerStep = Math.max(1, ~~(maxDrops * 5 / height) );
    };

    var $cv = $('<canvas></canvas>');
    var ctx = $cv[0].getContext('2d');
    var width = 0;
    var height = 0;
    var maxDrops = 0;
    var maxDropsPerStep = 0;

    var drops = [];

    var scale = 1;
    var w = 8 * scale;
    var h = 10 * scale;

    var drawDrop = function(c, x, y) {
      ctx.save();
      ctx.transform(-1, 0, 0, 1, x + w, y);
      drawFont(ctx, c, scale);
      ctx.restore();
    };

    var borns = {};

    var step = function(now) {

      // darker
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, width, height);

      if (drops.length < maxDrops) {
        for (var i = 0; i < maxDropsPerStep; i += 1) {
          var x = ~~(Math.random() * width / w) * w;
          if (typeof borns[x] == 'number' && borns[x] + 1000 > now) {
            continue;
          }
          borns[x] = now;
          drops.push({ x : x, y : 0, born : now });
        }
      }

      var newDrops = [];
      while (drops.length > 0) {

        var drop = drops.shift();
        var c = allChars[~~(Math.random() * allChars.length)];

        if (typeof drop.msgIndex != 'number' &&
            opts.message && Math.random() < opts.messageRate) {
          drop.msgIndex = 0;
        }
        if (typeof drop.msgIndex == 'number') {
          if(drop.msgIndex < opts.message.length) {
            c = opts.message.charAt(drop.msgIndex);
            drop.msgIndex += 1;
          }
          if(drop.msgIndex >= opts.message.length) {
            delete drop.msgIndex;
          }
        }

        ctx.fillStyle = opts.hiColor;
        drawDrop(c, drop.x, drop.y);
        if (drop.head) {
          ctx.fillStyle = opts.loColor;
          drawDrop(drop.head.c, drop.head.x, drop.head.y);
        }
        drop.head = { c : c, x : drop.x, y : drop.y };
        drop.y += h;
        if (drop.head.y < height) {
          newDrops.push(drop);
        }
      }
      drops = newDrops;
    };

    var time = 0;
    var render = function(now) {

      var size = opts.getSize();
      if (width != size.width || height != size.height) {
        width = size.width;
        height = size.height;
        sizeChanged();
      }

      if (now - time < 1000) {
        while (time < now) {
          step(time);
          time += 100;
        }
      } else {
        time = now;
      }

      window.requestAnimationFrame(render);
    };
    window.requestAnimationFrame(render);
    return $cv;
  };

  var drawFont = function(ctx, c, s) {

    var d = lcdfont.getData(c);
    var w = 5;
    var h = 7;

    var dark = function(x, y) { return (d[y] >> x) & 1; };
    var undark = function(x, y) { d[y] &= ~(1 << x); };

    for (var y = 0; y < h; y += 1) {
      for (var x = 0; x < w; x += 1) {
        if (dark(x, y) ) {
          var cw = s;
          var ch = s;
          if (x + 1 < w && dark(x + 1, y) ) {
            for (var i = 1; dark(x + i, y); i += 1) {
              undark(x + i, y);
              cw += s;
            }
          } else if (y + 1 < w && dark(x, y + 1) ) {
            for (var i = 1; dark(x, y + i); i += 1) {
              undark(x, y + i);
              ch += s;
            }
          }
          ctx.fillRect(x * s, y * s, cw, ch);
        }
      }
    }
  };

  var allChars = function() {
    var allChars = [];
    for (var i = 0; i < 95; i += 1) {
      allChars.push(String.fromCharCode(i + ' '.charCodeAt(0) ) );
    }
    for (var i = 0; i < 63; i += 1) {
      allChars.push(String.fromCharCode(i + '｡'.charCodeAt(0) ) );
    }
    return allChars;
  }();

  return createWorld;
}();
