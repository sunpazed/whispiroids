// whispiroids
//
// Blast as many as you can
// Designed as an easter egg for the whispir.io website
// Inspired by Mary Rose Cook's video https://vimeo.com/105955605
//
// Copyright (c) 2015 Franco Trimboli and contributors

;(function() {

var Game = function(canvasId) {

	// grab our playing area
	var canvas = document.getElementById(canvasId);

	// update the canvas to be the screen width
	canvas.width  = window.innerWidth;
	canvas.height = window.innerHeight; 

	var screen = canvas.getContext('2d');

	var self = this;

	// define height and width
    this.size = { x: screen.canvas.width, y: screen.canvas.height };
    this.center = { x: this.size.x / 2, y: this.size.y / 2 };
    this.score = 0;
	this.intervalms = (new Date).getTime();

	var gameSize = this.size;

	// total quantity of enemies on the screen
	this.enemyTotal = 800;

	// define sprites / game actors
    //(game, center, size)
    this.sprites = [
      new Enemy(this, { x: this.size.x*Math.random(), y: this.size.y*Math.random() }),
      new Enemy(this, { x: this.size.x*Math.random(), y: this.size.y*Math.random() }),
      new Enemy(this, { x: this.size.x*Math.random(), y: this.size.y*Math.random() }),
      new Enemy(this, { x: this.size.x*Math.random(), y: this.size.y*Math.random() }),
      new Enemy(this, { x: this.size.x*Math.random(), y: this.size.y*Math.random() }),
      new Enemy(this, { x: this.size.x*Math.random(), y: this.size.y*Math.random() }),
      new Enemy(this, { x: this.size.x*Math.random(), y: this.size.y*Math.random() }),
      new Enemy(this, { x: this.size.x*Math.random(), y: this.size.y*Math.random() }),
      new Player(this)
    ];


	// tick is one iteration of the game run every 60fps
	var tick = function() {
		self.update(gameSize);
		self.draw(screen, gameSize);
		self.checkEnemySizes();
		requestAnimationFrame(tick);
	};

	// start the clock
	tick();
}

Game.prototype = {

	update: function(gameSize) {

		// iterate thru and update each sprite obj
		for (var i = 0; i < this.sprites.length; i++) {
			this.sprites[i].update();

			// check if the sprite is within the confines of the game
			this.sprites[i].checkBounds(gameSize);
		}
		
		// let's check for any collisions between sprites
		checkCollisions(this.sprites);


	},

	draw: function(screen, gameSize) {

		// let's clear the screen
		screen.clearRect(0, 0, this.size.x, this.size.y);

		// iterate thru and render each sprite
		for (var i = 0; i < this.sprites.length; i++) {
			this.sprites[i].draw(screen);
		}

		updateScore(this,screen);

	},

	checkEnemySizes: function() {

		var currentms = (new Date).getTime();

		// check the aggregate sizes of every enemy each 5 seconds
		if ( (currentms - this.intervalms) > 5000 ) {
			this.intervalms = currentms;

			var sizes = 0;

			for (obj in this.sprites) {
				if (this.sprites[obj] instanceof Enemy) {
					sizes = sizes + this.sprites[obj].size;
				}

			}

			// if the enemy sizes < game.enemyTotals, then spawn another enemy
			if (sizes < this.enemyTotal) {

				// randomly spawn one of four screen edges				
				var spawnpos;

				if (Math.random() < 0.5) {
					spawnPosition = { x: (Math.random() > 0.5 ? this.size.x+100 : -100), y: (this.size.y * Math.random()) }
				} else {
					spawnPosition = { y: (Math.random() > 0.5 ? this.size.y+100 : -100), x: (this.size.x * Math.random()) }
				}

				// add a new sprite into the game  
				this.addSprite(new Enemy(this, spawnPosition));

				// increase total enemies on the screen
				this.enemyTotal = this.enemyTotal + 50;

			}

		}



	},


    addSprite: function(sprite) {
    	// push a sprite into the game array
		this.sprites.push(sprite);
    },

    removeSprite: function(sprite) {
	    // find where this sprite exists in the array
		var spriteIndex = this.sprites.indexOf(sprite);
		// found sprite? remove from array
		if (spriteIndex !== -1) {
			this.sprites.splice(spriteIndex, 1);
		}
    }


	
}


  var Enemy = function(game, center, size) {

    this.game = game;

    // start at a random angle
	this.angle = (Math.PI/180) * (Math.random() * 360);

    // pick randomly from those in an array
    this.colour = ["#FFC107","#F44336","#D61771","#18BEE5","#1BB37A","#8BC34A"][Math.round(Math.random()*6)]; 
    this.rotate = (Math.random() - 0.5) / 50;

	// generate points from the whispir point cloud
    this.center = center;
    this.points = genWhispir(this.center,this.angle,this.size);

    // minimum size is 80
    this.minSize = 80;

	if (size) {
		this.size = size;
	} else {
		this.size = this.minSize + (80 * Math.random());
	}

	// velocity of the enemy is random, with smaller enemies being faster
	this.maxVelocity = this.minSize / this.size;
    this.velocity = { x: (Math.random()*this.maxVelocity) - (this.maxVelocity/2), y: (Math.random()*this.maxVelocity) - (this.maxVelocity/2) };

  };


  Enemy.prototype = {

    update: function() {

	    this.angle = this.angle + this.rotate;

		this.center = geometry.translate(this.center, this.velocity);
	    this.points = genWhispir(this.center,this.angle,this.size);


    },

    draw: function(screen) {

		screen.beginPath();

		for (lines in this.points) {

			// grab first 2 points
			var points = {	x: (this.points[lines].x), y: (this.points[lines].y)}

			// just move to for the first points, draw for others
			if (lines%2 == 0) {
			    screen.moveTo( points.x, points.y );
			} else {
			    screen.lineTo( points.x, points.y );

			}


		}

		screen.lineWidth = 1;

		// if we're rendering the last 3 lines, then colour them approriately
		screen.strokeStyle = this.colour;
		screen.stroke();
		screen.closePath();

    },

	checkBounds: function(gameSize) {

		// if the sprite has exceeded the screen size, then wrap to the other side
		var boundedSize = this.size/2;

		if (this.center.x + boundedSize < 0) {
			this.center.x = gameSize.x + boundedSize
		}

		if (this.center.x - boundedSize > gameSize.x) {
			this.center.x = 0 - boundedSize;
		}

		if (this.center.y + boundedSize < 0) {
			this.center.y = gameSize.y + boundedSize;
		}

		if (this.center.y - boundedSize > gameSize.y) {
			this.center.y = 0 - boundedSize;
		}


	},

    collision: function() {

		this.game.score = (this.game.score + (Math.round(1000/this.size)*10) );

    	// if this sprite is greater than 50 in size, then split it into two
        if (this.size > 50) {
			var size = this.size / 2;
			this.game.addSprite(new Enemy(this.game, { x: this.center.x, y: this.center.y }, size));
			this.game.addSprite(new Enemy(this.game, { x: this.center.x, y: this.center.y }, size));
        }
        // remove sprite
        this.game.removeSprite(this);

    }


  };


  var Player = function(game) {

	this.game = game;

	// starting angle of ship
	this.angle = (Math.PI/180) * 0;

	// geometry of player ship from center origin 	
	this.center = { x: this.game.center.x, y: this.game.center.y };
	this.points = [{ x: this.center.x - 8, y: this.center.y + 9 },
	               { x: this.center.x,     y: this.center.y - 10 },
	               { x: this.center.x + 8, y: this.center.y + 9 }];

	// size of player (not used, just to support render)
	this.size = 2;

	// attach keyboard handler to player
	this.keyAction = new Input();
	
	// defines the current trajectory
	this.vector = { x: 0 , y: 0 }
	this.vectorForce = 0.05; // 0.05 seems to be the best feel at 60fps
	// current velocity
	this.velocity = { x: 0, y: 0 };

	this.lastShot = 0;

  };


  Player.prototype = {

    update: function() {

		// are we turning based on the keys? 
		// if so rotate, either left or right
		if (this.keyAction.isDown(this.keyAction.KEYS.LEFT)) {
			this.angle = this.angle - 0.05;
		} else if (this.keyAction.isDown(this.keyAction.KEYS.RIGHT)) {
			this.angle = this.angle + 0.05;
		}

		// hit space? then fire a missle if we haven't done so in the last 400ms
		if (this.keyAction.isDown(this.keyAction.KEYS.SPACE)) {

			var currentms = (new Date).getTime();
			if ( (currentms - this.lastShot) > 400 ) {
				// velocity of bullet needs to match current angle of the ship, no current direction
				var bulletVelocity = { y: Math.sin(this.angle - (Math.PI/180)*90) * 10,
										x: Math.cos(this.angle - (Math.PI/180)*90) * 10 };
				this.lastShot = currentms;
				// add a missle from the players position in the direction the ship is facing 
				this.game.addSprite(new Missle(this.game, { x: this.center.x, y: this.center.y }, this.angle, bulletVelocity) );
			}
		}


		// if we're pushing forward, then increase thust in the current angle direction
		if (this.keyAction.isDown(this.keyAction.KEYS.UP)) {
			// modify the vector by the vector force using the current angle
			this.vector.y = this.vector.y + Math.sin(this.angle - (Math.PI/180)*90) * this.vectorForce ; 
			this.vector.x = this.vector.x + Math.cos(this.angle - (Math.PI/180)*90) * this.vectorForce ;
		}

		// modify the velocity based on the current vector
		this.velocity = { x: this.vector.x, y: this.vector.y };

		// update the player position
		this.center = geometry.translate(this.center, this.velocity)
		// yes, we regenerate the player based on the current center position
		this.points = [{ x: this.center.x - 8, y: this.center.y + 9 },
		               { x: this.center.x,     y: this.center.y - 10 },
		               { x: this.center.x + 8, y: this.center.y + 9 }];

    },

    draw: function(screen) {

		screen.beginPath();

		for (lines in this.points) {

			// grab first 2 points
			var points = {	x: (this.points[lines].x), y: (this.points[lines].y)}
			// rotate points based on object angle and center
			var rotPoints = geometry.rotate(points, this.center, this.angle);

			// just move to for the first points, draw for others
			if (lines < 1) {
			    screen.moveTo( rotPoints.x, rotPoints.y );
			} else {
			    screen.lineTo( rotPoints.x, rotPoints.y );
			}

		}

		screen.lineWidth = 1;
		screen.strokeStyle = "white";
		screen.stroke();
		screen.closePath();

    },

	checkBounds: function(gameSize) {

		// if the sprite has exceeded the screen size, then wrap to the other side
		var boundedSize = this.size/2;

		if (this.center.x + boundedSize < 0) {
			this.center.x = gameSize.x + boundedSize
		}

		if (this.center.x - boundedSize > gameSize.x) {
			this.center.x = 0 - boundedSize;
		}

		if (this.center.y + boundedSize < 0) {
			this.center.y = gameSize.y + boundedSize;
		}

		if (this.center.y - boundedSize > gameSize.y) {
			this.center.y = 0 - boundedSize;
		}


	},

	collision: function() {

		// looks like the ship collided with an enemy
		this.game.removeSprite(this);

		// super fancy code to flash the screen
	    var body = document.getElementsByTagName("body");
	    body[0].style.backgroundColor = "red";
	    setTimeout(function(){ var body = document.getElementsByTagName("body"); body[0].style.backgroundColor = "black"; }, 100);

		// reset the score
		this.game.score = 0;

		// let's start again
		this.game.addSprite(new Player(this.game));
	}

  };

  var Missle = function(game, center, angle, velocity) {

  	this.size = 4;
  	this.game = game;
    this.angle = angle;
    this.center = center;
    this.colour = "white";

    // simple line for the missle
    this.points = [ { x: this.center.x, y: this.center.y },
				    { x: this.center.x, y: this.center.y + 6 },
				     ];    

    this.velocity = velocity;

  };

  Missle.prototype = {

    update: function() {

	// move the missle forward under the current velocity
	this.center = geometry.translate(this.center, this.velocity);
    this.points = [ { x: this.center.x, y: this.center.y },
				    { x: this.center.x, y: this.center.y + 6 },
				     ];    

    },

    draw: function(screen) {

		screen.beginPath();

		for (lines in this.points) {

			// grab first 2 points and rotate
			var points = {	x: (this.points[lines].x), y: (this.points[lines].y)}
			var rotPoints = geometry.rotate(points, this.center, this.angle);

			// just move to for the first points, draw for others
			if (lines < 1) {
			    screen.moveTo( rotPoints.x, rotPoints.y );
			} else {
			    screen.lineTo( rotPoints.x, rotPoints.y );
			}

		}

		screen.lineWidth = 1;
		screen.strokeStyle = this.colour;
		screen.stroke();
		screen.closePath();

    },

	checkBounds: function(gameSize) {

		// if the sprite has exceeded the screen size, then remove
		var boundedSize = this.size/2;

		if ( (this.center.x + boundedSize < 0) || (this.center.x - boundedSize > gameSize.x) || 
			(this.center.y + boundedSize < 0) || (this.center.y - boundedSize > gameSize.y) ) {
	        this.game.removeSprite(this);
		}


	},

    collision: function() {
		// we collided with something? get rid of the missle
        this.game.removeSprite(this);
    }


  };

// general geometry utils

var geometry = {

	// translate two points, return one
    translate: function(point, translation) {
      return { x: point.x + translation.x, y: point.y + translation.y };
    },

    vectorTo: function(point1, point2) {
      return { x: point2.x - point1.x, y: point2.y - point1.y };
    },

	// rotate a point about a pivot point by angle
    rotate: function(point, pivot, angle) {
      return {
        x: (point.x - pivot.x) * Math.cos(angle) -
          (point.y - pivot.y) * Math.sin(angle) +
          pivot.x,
        y: (point.x - pivot.x) * Math.sin(angle) +
          (point.y - pivot.y) * Math.cos(angle) +
          pivot.y
      };
    },

	// check intersection of line(p1,p2) and line(p3,p4)
	// via http://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function

	CCW: function(p1, p2, p3) {
			return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
	},

    isIntersecting: function(p1, p2, p3, p4) {
		return (this.CCW(p1, p3, p4) != this.CCW(p2, p3, p4)) && (this.CCW(p1, p2, p3) != this.CCW(p1, p2, p4));
	}
}


var updateScore = function(game, screen) {
	this.game = game;
	this.center = { x: this.game.center.x, y: (this.game.size.y) - 50 };
	this.game.score
	screen.font="30px monospace";
	screen.textBaseline = "hanging";
	screen.lineWidth = 0.8;
	screen.textAlign="center"; 
	screen.strokeStyle = "white";
	screen.strokeText(this.game.score,this.center.x,this.center.y);
}

// function to generate a Whispir sprite from the pointcloud
var genWhispir = function(center,angle,size) {

	var objpoints = [];

	// iterate thru the Whispir point cloud, each "v" is 6 points
	for (lines in Whispir) {

		var line = [];

		// grab first 2 points
		var points = {	x: (Whispir[lines][0]/100 * size) + center.x,
						y: (Whispir[lines][1]/100 * size) + center.y }
		// rotate points based on object angle and center
		var rotPoints = geometry.rotate(points, center, angle);
		// just move to, don't draw yet
	    objpoints.push( {x: rotPoints.x, y: rotPoints.y } );

		// grab next 2 points, rotate, and draw
		var points = {	x: (Whispir[lines][2]/100 * size) + center.x,
						y: (Whispir[lines][3]/100 * size) + center.y }
		var rotPoints = geometry.rotate(points, center, angle);
	    objpoints.push( {x: rotPoints.x, y: rotPoints.y } );
	    objpoints.push( {x: rotPoints.x, y: rotPoints.y } );

		// grab last 2 points, rotate, and draw
		var points = {	x: (Whispir[lines][4]/100 * size) + center.x,
						y: (Whispir[lines][5]/100 * size) + center.y }
		var rotPoints = geometry.rotate(points, center, angle);
	    objpoints.push( { x: rotPoints.x, y: rotPoints.y });

	}

	return objpoints;
}

// check collisions of each sprite
var checkCollisions = function(sprites) {

    var collisions = [];

  	// check collisions of each sprite type
	var player;
	var missles = [];
	var enemies = [];

  	// iterate thru and split each sprite into types
  	// lazy, and not worth doing this 60 frames per sec, but hey
	for (obj in sprites) {
		if (sprites[obj] instanceof Player) {
			player = sprites[obj];
		}
		if (sprites[obj] instanceof Missle) {
			missles.push(sprites[obj]);
		}
		if (sprites[obj] instanceof Enemy) {
			enemies.push(sprites[obj]);
		}

	}

	// check if any enemy has collided with a player
    for (var i = 0; i < enemies.length; i++) {
	    if (checkSpriteCollision(enemies[i], player)) {
			collisions.push(enemies[i]);
			collisions.push(player);			
		}
		// check if any missles have collided with an enemy
		for (var j = 0; j < missles.length; j++) {
			if (checkSpriteCollision(enemies[i], missles[j])) {
				collisions.push(enemies[i]);
				collisions.push(missles[j]);
			}			
		}
    }

	// we got collisions?
    if (collisions.length > 0) { 

		// if so, process each sprites collision logic
    	for (sprite in collisions) {
    		collisions[sprite].collision();
		}

	};
};

// check whether two sprites (a,b) have collided by performing a line intersection check
var checkSpriteCollision = function(a,b) {

	// erm, don't check the same sprite
  	if (a === b ) {
  		return false;
  	}

	// for the number of points in the first sprite
	for (var i = 0; i < a.points.length; i+=2) {
		// and for the number of points in the second sprite
		for (var j = 0; j < b.points.length; j+=2) {
			// grab a line from each sprite
			aline = getLine(a,i);
			bline = getLine(b,j);
			// do we have two valid lines?
			if (aline && bline) {
				// lines have intersected?
				var collided = geometry.isIntersecting(aline[0],aline[1],bline[0],bline[1]);
				if (collided) {
					// yep, stop checking any more lines
					return collided;
				}
			}

		}
	}

};

// helper function to grab a line from a sprite from an offset
var getLine = function(sprite,offset) {

  	if (sprite.points[offset] && sprite.points[offset+1] ) {
		return [ sprite.points[offset], sprite.points[offset+1] ];
	}
	else {
		return false;
	}
}; 

// this array describes a pointcloud of this Whispir logo 100 wide, centered on 0,0
var Whispir = [
		[-50,46.59,-23.28,-46.59,3.43,46.59],
		[-42.55,46.59,-15.83,-46.59,10.88,46.59],
		[-35.1,46.59,-8.38,-46.59,18.33,46.59],
		[-18.33,46.59,8.38,-46.59,35.1,46.59],
		[-10.88,46.59,15.83,-46.59,42.55,46.59],
		[-3.43,46.59,23.28,-46.59,50,46.59]
];

// as above, but re-generated for canvas
var WhispirPoints = [
		-50,46.59,-23.28,-46.59,3.43,46.59,
		-42.55,46.59,-15.83,-46.59,10.88,46.59,
		-35.1,46.59,-8.38,-46.59,18.33,46.59,
		-18.33,46.59,8.38,-46.59,35.1,46.59,
		-10.88,46.59,15.83,-46.59,42.55,46.59,
		-3.43,46.59,23.28,-46.59,50,46.59
];

// capture input from the keyboard
var Input = function() {

    var keyState = {};

    this.KEYS = { LEFT: 37, RIGHT: 39, UP: 38, SPACE: 32 };

    window.addEventListener('keydown', function(e) {
      keyState[e.keyCode] = true;
    });

    window.addEventListener('keyup', function(e) {
      keyState[e.keyCode] = false;
    });

    this.isDown = function(keyCode) {
      return keyState[keyCode] === true;
    };

  };

// start the game
window.onload = function() {
	new Game("screen");	
}

})();
