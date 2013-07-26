var global_game = null;

$(function() { 
	start_game();
});

function start_game(){
	var g = new game();
	global_game = g;
	$(window).resize(function() {
		g.resize();
	});
	
	g.start();
}

function game(){
	this.fps = 60;
	this.scale = 50;
	this.game_objects = [];														//global array of all objects to manage
	this.health = 100;
	this.points = 0;
	this.to_destroy = [];
	this.time_elapsed = 0;
}

game.prototype.resize = function(){
	var canvas = this.canvas;
	var w = 1136;																//Set the canvas dimensions to match the window dimensions
	var h = 640;
	
	canvas.width(w);
	canvas.height(h);
	
	canvas.attr('width' , w);
	canvas.attr('height' , h);
	
	this.canvas_width = canvas.attr('width');
	this.canvas_height = canvas.attr('height');
	
	this.scale = 50;

	this.screen_height = this.canvas_height/ this.scale;
	this.screen_width = this.canvas_width / this.scale;
}

game.prototype.setup = function(){
	this.ctx = ctx = $('#canvas').get(0).getContext('2d');
	var canvas = $('#canvas');
	this.canvas = canvas;
	
	this.resize();
	
	var w = this.screen_width;
	var h = this.screen_height;
	
	this.create_box2d_world();													//create the box2d world
	this.game_objects.push(new wall({x : 1, y: 0, width : 44, height:.25, friction: 1, game : this}));
	this.game_objects.push(new wall({x : -1, y: 0, width : .25, height: 12, friction: 0, game : this}));	
	this.game_objects.push(new wall({x : 23, y: 0, width : .25, height: 12, friction: 0, game : this}));	
	this.player = new player({x : w/2, y: 0 , game : this});					//the player
	this.game_objects.push(this.player);
	for(var i=0; i<3; i++){
		var tempX = 2 + Math.random() * 10;
		var tempY = 8 + Math.random() * 3;
		this.game_objects.push(new Enemy({x : tempX, y: tempY, width : 2, height: 2, unitType: "pizza",  game : this}));
	}
	this.game_objects.push(new Enemy({x : 2, y: 12, width : 2, height: 2, unitType: "meatball",  game : this}));

	this.start_handling();														//attach event handlers for key presses
	this.setup_collision_handler();												//setup collision handler too
}

game.prototype.create_box2d_world = function(){
	var gravity = new b2Vec2(0, -7);											//10m/s2 downwards, cartesian coordinates remember - we shall keep slightly lesser gravity
	
	var doSleep = false;														//Important to keep dynamic bodies from sleeping and going away
	var world = new b2World(gravity , doSleep);

	this.box2d_world = world;													//save in global object
}

game.prototype.start = function(){												//Start the game :) Setup and start ticking the clock
	this.on = true;
	this.total_health = 0;
	this.setup();
	this.is_paused = false;
	this.tick();
}

game.prototype.redraw_world = function(){
	this.ctx.clearRect(0 , 0 , this.canvas_width , this.canvas_height);
	
	var w = this.screen_width;
	var h = this.screen_height;
	var img = img_res('bg1.png');
	this.ctx.drawImage(img, 0 , 0 , this.canvas_width, this.canvas_height);
	
	write_text({x : 25 , y : 25 , font : 'bold 15px arial' , color : '#fff' , text : 'Health ' + this.health , ctx : this.ctx});
	write_text({x : 125 , y : 25 , font : 'bold 15px arial' , color : '#fff' , text : 'Score ' + this.points , ctx : this.ctx});
	
	for(var i in this.game_objects){
		this.game_objects[i].draw();
	}
}

game.prototype.tick = function(cnt){
	if(!this.is_paused && this.on){
		this.time_elapsed += 1;
		
		if(this.time_elapsed % 50 == 0){										//create a random object on top
			var xc = Math.random() * 8 + this.screen_width/2 - 4;
			var yc = 10;														// this.game_objects.push(new enemyProjectile({x : xc ,y : yc,game:this}));
		}
		
		for(var i in this.game_objects){										//tick all objects, if dead then remove
			if(this.game_objects[i].dead == true){
				delete this.game_objects[i];
				continue;
			}
			this.game_objects[i].tick();
		}
		
		this.perform_destroy();													//garbage collect dead thing
		this.box2d_world.Step(1/20 , 8 , 3);									//Step the box2d engine ahead
		this.box2d_world.ClearForces();											//important to clear forces, otherwise forces will keep applying
		this.redraw_world();													//redraw the world
		
		if(!this.is_paused && this.on){											//game.fps times in 1000 milliseconds or 1 second
			var that = this;													
			this.timer = setTimeout( function() { that.tick(); }  , 1000/this.fps);
		}
	}
}

game.prototype.perform_destroy = function(){
	for(var i in this.to_destroy){
		this.to_destroy[i].destroy();
	}
}

game.prototype.get_offset = function(vector){
	return new b2Vec2(vector.x - 0, Math.abs(vector.y - this.screen_height));
}

game.prototype.start_handling = function(){
	var that = this;
	
	$(document).on('keydown.game' , function(e){
		that.key_down(e);
		return false;
	});
	
	$(document).on('keyup.game' ,function(e){
		that.key_up(e);
		return false;
	});

	$(document).on('click', function (e){
		var mouseV = that.get_offset(new b2Vec2(e.pageX/that.scale, e.pageY/that.scale));

		that.player.shoot(mouseV);

	});
}

function getMousePos(canvas, evt) {																//Mouse Position Detector
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

game.prototype.key_down = function(e){
	var code = e.keyCode;

	if(code == 37){																//LEFT
		this.player.do_move_left = true;
	}
	else if(code == 38){														//UP
		this.player.jump();
	}
	else if(code == 39){														//RIGHT
		this.player.do_move_right = true;
	}
}

game.prototype.key_up = function(e){
	var code = e.keyCode;
	if(code == 38){																//UP KEY
		this.player.do_move_up = false;
		this.player.can_move_up = true;
	}
	else if(code == 37){														//LEFT
		this.player.do_move_left = false;
	}
	else if(code == 39){														//RIGHT
		this.player.do_move_right = false;
	}
}

game.prototype.setup_collision_handler = function(){
	var that = this;
	
	b2ContactListener.prototype.BeginContact = function (contact) {				//Override a few functions of class b2ContactListener
		var a = contact.GetFixtureA().GetUserData();
		var b = contact.GetFixtureB().GetUserData();
		
		if(a instanceof player && b instanceof enemyProjectile){
			that.destroy_object(b);
			that.health-= 5;
			that.points++;
		}
		else if(a instanceof enemyProjectile && b instanceof wall){						//enemyProjectile hits a wall
			that.destroy_object(a);
		}
		else if(a instanceof playerBullet && b instanceof Enemy){
			b.takeDamage(10);
			that.destroy_object(a);
		}
		else if(a instanceof playerBullet && b instanceof wall){
			that.destroy_object(a);
		}
		else if(a instanceof playerBullet && b instanceof enemyProjectile){
			that.destroy_object(a);
			that.destroy_object(b);
		}
		// else if(a instanceof Enemy && b instanceof wall){
		// 	that.destroy_object(a);
		// }

	}
}

game.prototype.destroy_object = function(obj){									//schedule an object for destruction in next tick
	this.to_destroy.push(obj);
}

// canvas.addEventListener('click', function(evt) {

// 	}, false );