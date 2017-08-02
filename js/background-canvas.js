'use strict';

function CanvasAnimation(canvas, options, generator) {
    // ============== 辅助函数 =================
    window.requestAnimFrame = (function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame || window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function ( /* function FrameRequestCallback */ callback, /* DOMElement Element */
                element) {
                return window.setTimeout(callback, 1000 / 60);
            };
    })();

    var extend = function (o, n) {
        for (var p in n) {
            if (n.hasOwnProperty(p) && o.hasOwnProperty(p)) {
                o[p] = n[p];
            }
        }
    }

    this.delay = (function () {
        var timer = 0;
        return function (callback, ms) {
            clearTimeout(timer);
            timer = setTimeout(callback, ms);
        };
    })();
    // ========================================
    this.opts = {
        width: 800,
        height: 600,
        dt: 1000 / 60
    }

    extend(this.opts, options);

    canvas.width = this.opts.width;
    canvas.height = this.opts.height;

    this.objs = {};
    this.objs.canvas = canvas;
    this.objs.context = canvas.getContext("2d");
    this.objs.canvasElement = [];
    this.objs.lastTime = 0;
    this.objs.acc = 0;
    this.objs.isRunning = false;

    this.objs.generator = generator;
    this.objs.generator.init(this, this.opts.width, this.opts.height);

    var that = this;
    this.mainLoop = function () {
        if (that.objs.isRunning) {
            window.requestAnimationFrame(that.mainLoop);
        }

        var now = Date.now();
        var deltaTime = now - that.objs.lastTime;
        that.objs.lastTime = now;
        that.objs.acc += deltaTime;

        while (that.objs.acc >= that.opts.dt) {
            update(that.opts.dt);
            that.objs.acc -= that.opts.dt;
        }
        draw(deltaTime);
        cleanup();
    }

    function update(deltatime) {
        that.objs.canvasElement.forEach(function (item) {
            item.update(deltatime);
        });
    }

    function draw(deltatime) {
        that.objs.context.clearRect(0, 0, that.opts.width, that.opts.height);
        that.objs.canvasElement.forEach(function (item) {
            item.draw(deltatime, that.objs.context);
        });
    }

    function cleanup() {
        for (var i = that.objs.canvasElement.length - 1; i >= 0; i--) {
            if (that.objs.canvasElement[i].isDead()) {
                that.objs.canvasElement.slice(i, 1);
            }
        }
    }
}

CanvasAnimation.prototype.getHeight = function () {
    return this.opts.height;
}

CanvasAnimation.prototype.getWidht = function () {
    return this.opts.width;
}

CanvasAnimation.prototype.withSize = function (width, height) {
    this.opts.width = width;
    this.opts.height = height;

    this.objs.canvas.width = width;
    this.objs.canvas.height = height;

    var that = this;
    this.delay(function () {
        that.objs.canvasElement.forEach(function (item) {
            item.resize(width, height);
        });
    }, 200);
}

CanvasAnimation.prototype.start = function () {
    this.objs.canvasElement.forEach(function (item) {
        item.init();
    });
    this.objs.isRunning = true;
    this.objs.lastTime = Date.now();
    this.mainLoop();
}

CanvasAnimation.prototype.addSpirit = function (spirit) {
    this.objs.canvasElement.push(spirit);
}

//================生成器=====================

function SpiritGenerator() {
    this.opts = {
        particleAmount: 100,                   //粒子个数
        defaultSpeed: 0.1,                      //粒子运动速度
        variantSpeed: 0.5,                      //粒子运动速度的变量
        particleColor: "rgb(181,181,181)",     //粒子的颜色
        lineColor: "rgb(181,181,181)",         //网格连线的颜色
        defaultRadius: 1,                     //粒子半径
        variantRadius: 2,                     //粒子半径的变量
        minDistance: 100                      //粒子之间连线的最小距离
    }

    this.spirits = [];
}

SpiritGenerator.prototype.buildSpirit = function (borderWidth, borderHeight) {
    var that = this;
    return (function () {
        var x = Math.random() * borderWidth;
        var y = Math.random() * borderHeight;
        var w = borderWidth;
        var h = borderHeight;
        var speed = that.opts.defaultSpeed + that.opts.variantSpeed * Math.random();
        var directionAngle = Math.floor(Math.random() * 360);
        var color = that.opts.particleColor;
        var radius = that.opts.defaultRadius + Math.random() * that.opts.variantRadius;
        var vector = {
            x: speed * Math.cos(directionAngle),
            y: speed * Math.sin(directionAngle)
        };
        var lineColor = that.opts.lineColor.match(/\d+/g);
        return {
            x: function () {
                return x;
            },
            y: function () {
                return y;
            },
            init: function () {

            },
            update: function (deltatime) {
                if (x > w || x <= 0) {
                    vector.x *= -1;
                }
                if (y > h || y <= 0) {
                    vector.y *= -1;
                }
                x += vector.x;
                y += vector.y;
            },
            draw: function (deltatime, ctx) {
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fillStyle = color;
                ctx.fill();

                for (var i = 0; i < that.spirits.length; i++) {
                    var distance = Math.sqrt(Math.pow(x - that.spirits[i].x(), 2) + Math.pow(y - that.spirits[i].y(), 2));
                    var opacity = 1 - distance / that.opts.minDistance;
                    if (opacity > 0) {
                        ctx.lineWidth = 0.5;
                        ctx.strokeStyle = "rgba(" + lineColor[0] + "," + lineColor[1] + "," + lineColor[2] + "," + opacity + ")";
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        ctx.lineTo(that.spirits[i].x(), that.spirits[i].y());
                        ctx.closePath();
                        ctx.stroke();
                    }

                }
            },
            resize: function (width, height) {
                w = width;
                h = height;
                if (x >= w) x = w;
                if (y >= h) y = h;
            },
            isDead: function () {
                return false;
            }
        }
    })();
}

SpiritGenerator.prototype.init = function (engine, canvasWidth, canvasHeight) {
    for (var i = 0; i < this.opts.particleAmount; i++) {
        var spirit = this.buildSpirit(canvasWidth, canvasHeight);
        engine.addSpirit(spirit);
        this.spirits.push(spirit);
    }
}

// function render () {
//   var canvas = document.querySelector('#background-canvas')
//   if (!canvas) {
//     return
//   }
//   var ctx = canvas.getContext('2d')

//   canvas.width = window.innerWidth
//   canvas.height = window.innerHeight
//   ctx.lineWidth = 0.3
//   ctx.strokeStyle = (new Color(150)).style

//   var i, j, iDot, jDot

//   var mousePosition = {
//     x: 30 * canvas.width / 100,
//     y: 30 * canvas.height / 100
//   }

//   var dots = {
//     nb: 750,
//     distance: 50,
//     d_radius: 100,
//     array: []
//   }

//   function colorValue (min) {
//     return Math.floor(Math.random() * 255 + min)
//   }

//   function createColorStyle (r, g, b) {
//     return 'rgba(' + r + ',' + g + ',' + b + ', 0.8)'
//   }

//   function mixComponents (comp1, weight1, comp2, weight2) {
//     return (comp1 * weight1 + comp2 * weight2) / (weight1 + weight2)
//   }

//   function averageColorStyles (dot1, dot2) {
//     var color1 = dot1.color
//     var color2 = dot2.color

//     var r = mixComponents(color1.r, dot1.radius, color2.r, dot2.radius)
//     var g = mixComponents(color1.g, dot1.radius, color2.g, dot2.radius)
//     var b = mixComponents(color1.b, dot1.radius, color2.b, dot2.radius)
//     return createColorStyle(Math.floor(r), Math.floor(g), Math.floor(b))
//   }

//   function Color (min) {
//     min = min || 0
//     this.r = colorValue(min)
//     this.g = colorValue(min)
//     this.b = colorValue(min)
//     this.style = createColorStyle(this.r, this.g, this.b)
//   }

//   function Dot () {
//     this.x = Math.random() * canvas.width
//     this.y = Math.random() * canvas.height

//     this.vx = -0.5 + Math.random()
//     this.vy = -0.5 + Math.random()

//     this.radius = Math.random() * 2

//     this.color = new Color()
//     // console.log(this)
//   }

//   Dot.prototype = {
//     draw: function () {
//       ctx.beginPath()
//       ctx.fillStyle = this.color.style
//       ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
//       ctx.fill()
//     }
//   }

//   function createDots () {
//     for (i = 0; i < dots.nb; i++) {
//       dots.array.push(new Dot())
//     }
//   }

//   function moveDots () {
//     for (i = 0; i < dots.nb; i++) {
//       var dot = dots.array[i]

//       if (dot.y < 0 || dot.y > canvas.height) {
//         dot.vx = dot.vx
//         dot.vy = -dot.vy
//       } else if (dot.x < 0 || dot.x > canvas.width) {
//         dot.vx = -dot.vx
//         dot.vy = dot.vy
//       }
//       dot.x += dot.vx
//       dot.y += dot.vy
//     }
//   }

//   function connectDots () {
//     for (i = 0; i < dots.nb; i++) {
//       for (j = 0; j < dots.nb; j++) {
//         iDot = dots.array[i]
//         jDot = dots.array[j]

//         if ((iDot.x - jDot.x) < dots.distance && (iDot.y - jDot.y) < dots.distance && (iDot.x - jDot.x) > -dots.distance && (iDot.y - jDot.y) > -dots.distance) {
//           if ((iDot.x - mousePosition.x) < dots.d_radius && (iDot.y - mousePosition.y) < dots.d_radius && (iDot.x - mousePosition.x) > -dots.d_radius && (iDot.y - mousePosition.y) > -dots.d_radius) {
//             ctx.beginPath()
//             ctx.strokeStyle = averageColorStyles(iDot, jDot)
//             ctx.moveTo(iDot.x, iDot.y)
//             ctx.lineTo(jDot.x, jDot.y)
//             ctx.stroke()
//             ctx.closePath()
//           }
//         }
//       }
//     }
//   }

//   function drawDots () {
//     for (i = 0; i < dots.nb; i++) {
//       var dot = dots.array[i]
//       dot.draw()
//     }
//   }

//   function animateDots () {
//     ctx.clearRect(0, 0, canvas.width, canvas.height)
//     moveDots()
//     connectDots()
//     drawDots()

//     requestAnimationFrame(animateDots)
//   }

//   canvas.onmousemove = function (e) {
//     mousePosition.x = e.pageX
//     mousePosition.y = e.pageY
//   }

//   canvas.onmouseleave = function (e) {
//     mousePosition.x = canvas.width / 2
//     mousePosition.y = canvas.height / 2
//   }

//   createDots()
//   requestAnimationFrame(animateDots)
// }
