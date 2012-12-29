/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  this.Class = function(){};

  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;

    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" && 
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];

            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;

            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }

    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }

    // Populate our constructed prototype object
    Class.prototype = prototype;

    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;

    return Class;
  };
})();

$(function() {

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  //
  // Helper class that encapsulates functionality of a 2D vector.
  //
  var Vector2 = Class.extend({
    init: function(x, y) {
      if (typeof y == "undefined") {
        this.x = x.x;
        this.y = x.y;
      } else {
        this.x = x;
        this.y = y;
      }
    },

    length: function() {
      return Math.sqrt((this.x * this.x) + (this.y * this.y));
    },

    normalize: function() {
      var scale = 1.0 / this.length();
      this.x *= scale;
      this.y *= scale;
    },

    add: function(pt) {
      this.x += pt.x;
      this.y += pt.y;
    },

    directionTo: function(pt) {
      var v = new Vector2(pt.x - this.x, pt.y - this.y);
      v.normalize();
      return v;
    },

    scale: function(s) {
      this.x *= s;
      this.y *= s;
    }
  });


  //
  // Base class for any object that appears in the "world". Has a position,
  // size and image. The size is used to render the image (which we assume
  // to be a square).
  //
  var WorldObject = Class.extend({
    init: function(position, img, size) {
      this.world = null; // the world will set this up for us
    },

    update: function(now) {},

    render: function(context) {}
  });

  var Sprite = WorldObject.extend({
    init: function(position, img, size) {
      this.position = position;
      this.img = img;
      this.size = size;
    },

    render: function(context) {
      if (!this.img.complete) {
        return;
      }

      if (this.size == 0) {
        context.drawImage(this.img,
                          this.position.x,
                          this.position.y);
      } else {
        context.drawImage(this.img,
                          this.position.x - (this.size/2),
                          this.position.y - (this.size/2),
                          this.size, this.size);
      }
    }
  });

  var Star = WorldObject.extend({
    init: function(pb) {
      this.name = pb.name;
      this.type = pb.classification;
      this.sectorX = pb.sector_x;
      this.sectorY = pb.sector_y;
      this.offsetX = pb.offset_x;
      this.offsetY = pb.offset_y;
      this.key = pb.key;
      this.size = pb.size * 1.5;

      Math.seedrandom(this.key);
      this.imgIndex = randomInt(0, 3);
    },

    render: function(context, offsetX, offsetY) {
      if (Star.small.img.complete) {
        var slice = Star.small[this.type][this.imgIndex];
        context.drawImage(Star.small.img,
          slice.x, slice.y, slice.width, slice.height,
          offsetX + this.offsetX - (this.size * slice.scale / 2),
          offsetY + this.offsetY - (this.size * slice.scale / 2),
          this.size * slice.scale, this.size * slice.scale);
      }

      context.textAlign = "center";
      context.font = "12pt sans-serif"
      context.fillText(this.name,
                      offsetX + this.offsetX,
                      offsetY + this.offsetY + this.size + 6);
    }
  });
  Star.small = {
    img: new Image(),
    "CLASSIFICATION.BLACKHOLE": [
      {x: 0, y: 0, width: 32, height: 32, scale: 1},
      {x: 32, y: 0, width: 32, height: 32, scale: 1},
      {x: 64, y: 0, width: 32, height: 32, scale: 1},
      {x: 96, y: 0, width: 32, height: 32, scale: 1}
    ],
    "CLASSIFICATION.BLUE": [
      {x: 0, y: 32, width: 32, height: 32, scale: 1},
      {x: 32, y: 32, width: 32, height: 32, scale: 1},
      {x: 64, y: 32, width: 32, height: 32, scale: 1},
      {x: 96, y: 32, width: 32, height: 32, scale: 1}
    ],
    "CLASSIFICATION.NEUTRON": [
      {x: 0, y: 64, width: 64, height: 64, scale: 4},
      {x: 64, y: 64, width: 64, height: 64, scale: 4},
      {x: 0, y: 128, width: 64, height: 64, scale: 4},
      {x: 64, y: 128, width: 64, height: 64, scale: 4}
    ],
    "CLASSIFICATION.ORANGE": [
      {x: 0, y: 192, width: 32, height: 32, scale: 1},
      {x: 32, y: 192, width: 32, height: 32, scale: 1},
      {x: 64, y: 192, width: 32, height: 32, scale: 1},
      {x: 96, y: 192, width: 32, height: 32, scale: 1}
    ],
    "CLASSIFICATION.RED": [
      {x: 0, y: 224, width: 32, height: 32, scale: 1},
      {x: 32, y: 224, width: 32, height: 32, scale: 1},
      {x: 64, y: 224, width: 32, height: 32, scale: 1},
      {x: 96, y: 224, width: 32, height: 32, scale: 1}
    ],
    "CLASSIFICATION.WHITE": [
      {x: 0, y: 256, width: 32, height: 32, scale: 1},
      {x: 32, y: 256, width: 32, height: 32, scale: 1},
      {x: 64, y: 256, width: 32, height: 32, scale: 1},
      {x: 96, y: 256, width: 32, height: 32, scale: 1}
    ],
    "CLASSIFICATION.YELLOW": [
      {x: 0, y: 288, width: 32, height: 32, scale: 1},
      {x: 32, y: 288, width: 32, height: 32, scale: 1},
      {x: 64, y: 288, width: 32, height: 32, scale: 1},
      {x: 96, y: 288, width: 32, height: 32, scale: 1}
    ]
  };
  Star.small.img.src = "/intel/stars_small.png";
  Star.small.img.onload = function() { world.draw(); }

  var Sector = WorldObject.extend({
    init: function(pb) {
      this.sectorX = pb.x;
      this.sectorY = pb.y;
      this.stars = [];
      for (var i = 0; i < pb.stars.length; i++) {
        var star = new Star(pb.stars[i]);
        this.stars.push(star);
      }

      Math.seedrandom(this.sectorX+","+this.sectorY);
      this.backgroundIndex = randomInt(0, 1);

      this.gases = [];
      for (var i = 0; i < 10; i++) {
        var gas = {};
        gas.index = randomInt(0, Sector.gases.length - 1);
        gas.x = randomInt(0, Sector.SIZE);
        gas.y = randomInt(0, Sector.SIZE);
        this.gases.push(gas);
      }
    },

    render: function(context) {
      var x = this.world.offsetX + Sector.SIZE * (this.sectorX - this.world.sectorX);
      var y = this.world.offsetY + Sector.SIZE * (this.sectorY - this.world.sectorY);

      var background = Sector.backgrounds[this.backgroundIndex];
      if (background.complete) {
        context.drawImage(background, x, y, Sector.SIZE, Sector.SIZE);
      }
      for (var i = 0; i < this.gases.length; i++) {
        var img = Sector.gases[this.gases[i].index];
        if (!img.complete) {
          continue;
        }
        var width = img.naturalWidth * 2;
        var height = img.naturalHeight * 2;
        context.drawImage(img,
                          x + this.gases[i].x - (width / 2),
                          y + this.gases[i].y - (height / 2),
                          width, height);
      }

      for (var i = 0; i < this.stars.length; i++) {
        this.stars[i].render(context, x, y);
      }
    }
  });
  Sector.SIZE = 1024;
  Sector.backgrounds = [new Image(), new Image()];
  Sector.backgrounds[0].src = "/intel/decoration/starfield/01.png";
  Sector.backgrounds[1].src = "/intel/decoration/starfield/02.png";
  Sector.gases = [];
  for (var i = 0; i <= 13; i++) {
    var img = new Image();
    var name = "00"+i;
    name = name.substr(name.length - 2);
    img.src = "/intel/decoration/gas/"+name+".png";
    img.onload = function () {
      world.draw();
    }
    Sector.gases.push(img);
  }

  //
  // The World is the container for all the objects.
  //
  var World = Class.extend({
    init: function() {
      this._sectors = [];
      this._inTransitSectors = [];
      this.offsetX = 0;
      this.offsetY = 0;
      this.sectorX = 0;
      this.sectorY = 0;
    },

    drag: function(dx, dy, onComplete) {
      this.offsetX += dx;
      this.offsetY += dy;

      while (this.offsetX < -(Sector.SIZE/2)) {
        this.sectorX += 1;
        this.offsetX += Sector.SIZE;
      }
      while (this.offsetX > (Sector.SIZE/2)) {
        this.sectorX -= 1;
        this.offsetX -= Sector.SIZE;
      }
      while (this.offsetY < -(Sector.SIZE/2)) {
        this.sectorY += 1;
        this.offsetY += Sector.SIZE;
      }
      while (this.offsetY > (Sector.SIZE/2)) {
        this.sectorY -= 1;
        this.offsetY -= Sector.SIZE;
      }
      this.refreshSectors();

      this.draw(onComplete);
    },

    update: function(now) {
      for (var i = 0; i < this._sectors.length; i++) {
        this._sectors[i].update(now);
      }
    },

    render: function(canvas) {
      var context = canvas.getContext("2d");
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#fff";
      context.strokeStyle = "#fff";

      for (var i = 0; i < this._sectors.length; i++) {
        this._sectors[i].render(context);
      }
    },

    draw: function(onComplete) {
      function requestFrame(callback) {
        var fn = window.C ||
                 window.webkitRequestAnimationFrame ||
                 window.mozRequestAnimationFrame ||
                 window.oRequestAnimationFrame ||
                 window.msRequestAnimationFrame;
        fn(callback);
      }

      var world = this;
      function doDraw() {
        var canvas = document.getElementById("main-canvas");
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        world.update(new Date());
        world.render(canvas);

        if (onComplete) {
          onComplete();
        }
      }

      requestFrame(doDraw);
    },

    // checks whether we need to fetch some new sectors from the server, and
    // then fetches them if we do.
    refreshSectors: function() {
      var neededSectors = [];
      for (var y = this.sectorY - 1; y <= this.sectorY + 1; y++ ) {
        for (var x = this.sectorX - 1; x <= this.sectorX + 1; x++) {
          neededSectors.push({"sectorX": x, "sectorY": y});
        }
      }

      // go through the existing objects and remove any that's not in the
      // list of "needed" sectors
      var existingSectors = []
      for (var i = 0; i < this._sectors.length; i++ ) {
        for (var j = 0; j < neededSectors.length; j++) {
          if (this._sectors[i].sectorX == neededSectors[j].sectorX &&
              this._sectors[i].sectorY == neededSectors[j].sectorY) {
            existingSectors.push(this._sectors[i]);
          }
        }
      }
      this._sectors = existingSectors;

      // now build up the URL of sectors that are in neededSectors, but NOT
      // in existingSectors...
      var missingSectors = []
      for (var i = 0; i < neededSectors.length; i++) {
        var found = false;
        var key = neededSectors[i].sectorX+","+neededSectors[i].sectorY;
        for (var j = 0; j < existingSectors.length; j++) {
          if (neededSectors[i].sectorX == existingSectors[j].sectorX &&
              neededSectors[i].sectorY == existingSectors[j].sectorY) {
            found = true;
          }
        }
        for (var j = 0; j < this._inTransitSectors.length; j++) {
          if (this._inTransitSectors[j] == key) {
            found = true;
          }
        }
        if (!found) {
          missingSectors.push(key);
        }
      }

      if (missingSectors.length > 0) {
        for (var i = 0; i < missingSectors.length; i++) {
          this._inTransitSectors.push(missingSectors[i]);
        }

        console.log("fetching sectors: "+missingSectors.join("|"));
        var world = this;
        $.ajax({
          url: "/api/v1/sectors?coords="+missingSectors.join("|")+"&gen=0",
          dataType: "json",
          success: function (data) {
            if (!data || !data.sectors) {
              return;
            }
            for (var i = 0; i < data.sectors.length; i++) {
              var sector = new Sector(data.sectors[i]);
              sector.world = world;
              world._sectors.push(sector);

              var key = sector.sectorX+","+sector.sectorY;
              var remainingInTransitSectors = [];
              for (var j = 0; j < world._inTransitSectors.length; j++) {
                if (world._inTransitSectors[j] == key) {
                  continue;
                }
                remainingInTransitSectors.push(world._inTransitSectors[j]);
              }
              world._inTransitSectors = remainingInTransitSectors;
            }
            world.draw();
          },
          error: function() {
            alert("An error occurred fetching starfield data. Sorry.");
          }
        });
      }
    }
  });

  var world = new World();
  world.refreshSectors();

  // this is our click-and-drag code that handles scrolling around the world
  $(function() {
    var canvas = $("#main-canvas");
    var isDragging = false;
    var lastX = 0;
    var lastY = 0;
    canvas.on("mousedown", function(evnt) {
      isDragging = true;
      lastX = evnt.pageX;
      lastY = evnt.pageY;
    }).on("mouseup", function(evnt) {
      isDragging = false;
    }).on("mousemove", function(evnt) {
      if (isDragging) {
        var dx = evnt.pageX - lastX;
        var dy = evnt.pageY - lastY;
        lastX = evnt.pageX;
        lastY = evnt.pageY;

        world.drag(dx, dy);
      }
    });

    var LEFT = 37;
    var UP = 38;
    var RIGHT = 39;
    var DOWN = 40;

    var pressed = [];
    function keyScroll() {
      if (pressed.length == 0) {
        return;
      }

      var dx = 0;
      var dy = 0;
      for (var i = 0; i < pressed.length; i++) {
        if (pressed[i] == LEFT) {
          dx ++;
        } else if (pressed[i] == UP) {
          dy ++;
        } else if (pressed[i] == RIGHT) {
          dx --;
        } else if (pressed[i] == DOWN) {
          dy --;
        }
      }
      world.drag(dx, dy, keyScroll);
    }

    $(document).on("keydown", function(evnt) {
      if (evnt.which >= LEFT && evnt.which <= DOWN) {
        pressed.push(evnt.which);
        keyScroll();
      }
    }).on("keyup", function(evnt) {
      if (evnt.which >= LEFT && evnt.which <= DOWN) {
        var remaining = []
        for (var i = 0; i < pressed.length; i++) {
          if (pressed[i] != evnt.which) {
            remaining.push(pressed[i]);
          }
        }
        pressed = remaining;
      }
    });;
  });
});