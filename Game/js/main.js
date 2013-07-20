
var global_game = null;

//start game once page has finished loaded
$(function() { 
	start_game();
});

function start_game()
{
	var g = new game();
	
	global_game = g;
	
	$(window).resize(function() {
		g.resize();
	});
	
	g.start();
}

function game()
{
	this.fps = 60;
	this.scale = 50;
	
	
	this.game_objects = [];														//global array of all objects to manage
	
	this.points = 0;
	this.to_destroy = [];
	this.time_elapsed = 0;
}

game.prototype.resize = function()
{
	var canvas = this.canvas;
	
	var w = 1136;																//Set the canvas dimensions to match the window dimensions
	var h = 640;
	
	canvas.width(w);
	canvas.height(h);
	
	canvas.attr('width' , w * 0.75);
	canvas.attr('height' , h * 0.75);
	
	this.canvas_width = canvas.attr('width');
	this.canvas_height = canvas.attr('height');
	
	this.screen_height = 10;
	this.scale = this.canvas_height / this.screen_height;
	this.screen_width = this.canvas_width / this.scale;
}

game.prototype.setup = function()
{
	this.ctx = ctx = $('#canvas').get(0).getContext('2d');
	var canvas = $('#canvas');
	this.canvas = canvas;
	
	this.resize();
	
	var w = this.screen_width;
	var h = this.screen_height;
	
	this.create_box2d_world();													//create the box2d world
	this.game_objects.push(new wall({x : 1, y: 0, width : 34, height:1, game : this}));	
	this.player = new player({x : w/2, y: h/2 , game : this});					//the player
	this.game_objects.push(this.player);
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
	this.total_points = 0;
	this.setup();
	this.is_paused = false;
	this.tick();
}

game.prototype.redraw_world = function(){
	this.ctx.clearRect(0 , 0 , this.canvas_width , this.canvas_height);
	
	var w = this.screen_width;
	var h = this.screen_height;
	
	var img = img_res('orange_hills.png');
	this.ctx.drawImage(img, 0 , 0 , this.canvas_width, this.canvas_height);
	
	write_text({x : 25 , y : 25 , font : 'bold 15px arial' , color : '#fff' , text : 'Score ' + this.points , ctx : this.ctx})
	
	for(var i in this.game_objects){
		this.game_objects[i].draw();
	}
}

game.prototype.tick = function(cnt){
	if(!this.is_paused && this.on){
		this.time_elapsed += 1;
		
		if(this.time_elapsed % 50 == 0){											//create a random object on top
			var xc = Math.random() * 8 + this.screen_width/2 - 4;
			var yc = 10;
			console.log(this.screen_height/2);
			this.game_objects.push(new apple({x : xc ,y : yc,game:this}));
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
		
		if(a instanceof player && b instanceof apple){
			that.destroy_object(b);
			that.points++;
		}
		else if(b instanceof player && a instanceof apple){
			that.destroy_object(a);
			that.points++;
		}
		else if(a instanceof apple && b instanceof wall){						//apple hits a wall
			that.destroy_object(a);
		}
	}
}

game.prototype.destroy_object = function(obj){									//schedule an object for destruction in next tick
	this.to_destroy.push(obj);
}

function apple(options){
	this.height = 0.25;
	this.width = 0.25;
	this.x = options.x;
	this.y = options.y;
	
	this.game = options.game;
	
	var linear_damping = 2;
	
	var info = { 
		'density' : 10 ,
		'linearDamping' : linear_damping ,
		'fixedRotation' : true ,
		'userData' : this ,
		'type' : b2Body.b2_dynamicBody ,
	};
	
	var body = create_box(this.game.box2d_world , this.x, this.y, this.width, this.height, info);
	this.body = body;
}

apple.img = img_res('apple.png');

apple.prototype.draw = function(){
	if(this.body == null){
		return false;
	}
	
	var c = this.game.get_offset(this.body.GetPosition());
	var scale = this.game.scale;
	
	var sx = c.x * scale;
	var sy = c.y * scale;
	
	var width = this.width * scale;
	var height = this.height * scale;
	
	this.game.ctx.translate(sx, sy);
	this.game.ctx.drawImage(apple.img , -width / 2, -height / 2, width, height);
	this.game.ctx.translate(-sx, -sy);
}

apple.prototype.tick = function(){
	this.age++;
	
	if(this.body.GetPosition().y < 0){											//destroy the apple if it falls below the x axis
		this.game.destroy_object(this);
	}
}


apple.prototype.destroy = function(){											//Destroy the apple when player eats it
	if(this.body == null){
		return;
	}
	this.body.GetWorld().DestroyBody( this.body );
	this.body = null;
	this.dead = true;
}

function player(options){
	this.height = 1.3;
	this.width = 2.0;
	
	this.x = options.x;
	this.y = options.y;
	this.game = options.game;
	this.age = 0;
		
	this.do_move_left = false;
	this.do_move_right = false;
	this.max_hor_vel = 2.5;
	this,max_ver_vel = 4;
	this.can_move_up = true;
	
	var info = { 
		'density' : 10 ,
		'fixedRotation' : true ,
		'userData' : this ,
		'type' : b2Body.b2_dynamicBody ,
		'restitution' : 0.0 ,
	};
	
	var body = create_box(this.game.box2d_world , this.x, this.y, this.width, this.height, info);
	this.body = body;
}

player.prototype.tick = function(){
	if(this.is_out()){															//turn off the game
		this.game.on = false;
		start_game();
	}
	
	if(this.do_move_left){
		this.add_velocity(new b2Vec2(-3,0));
	}
	
	if(this.do_move_right){
		this.add_velocity(new b2Vec2(3,0));
	}
	
	if(this.do_move_up && this.can_move_up){
		this.add_velocity(new b2Vec2(0,6));
		this.can_move_up = false;
	}
	
	this.age++;
}

player.prototype.add_velocity = function(vel){
	var b = this.body;
	var v = b.GetLinearVelocity();
	
	v.Add(vel);																	//check for max horizontal and vertical velocities and then set
	if(Math.abs(v.y) > this.max_ver_vel){
		v.y = this.max_ver_vel * v.y/Math.abs(v.y);
	}
	if(Math.abs(v.x) > this.max_hor_vel){
		v.x = this.max_hor_vel * v.x/Math.abs(v.x);
	}
	
	b.SetLinearVelocity(v);														//set the new velocity
}
player.img = img_res('tacosmall.png');

player.prototype.draw = function(){
	if(this.body == null){
		return false;
	}

	var c = this.game.get_offset(this.body.GetPosition());
	var scale = this.game.scale;
	var sx = c.x * scale;
	var sy = c.y * scale;
	
	var width = this.width * scale;
	var height = this.height * scale;
	
	this.game.ctx.translate(sx, sy);
	this.game.ctx.drawImage(player.img , -width / 2, -height / 2, width, height);
	this.game.ctx.translate(-sx, -sy);
}

player.prototype.jump = function(){												//if player is already in vertical motion, then cannot jump
	if(Math.abs(this.body.GetLinearVelocity().y) > 0.0){
		return false;
	}
	this.do_move_up = true;
}

player.prototype.is_out = function(){											//if player has fallen below the 0 level of y axis in the box2d coordinates, then he is out
	if(this.body.GetPosition().y < 0){
		return true;
	}
	return false;
}
														
function wall(options)	{														//Static Wall object
	this.x = options.x;
	this.y = options.y;
	this.height = options.height;
	this.width = options.width;
	this.game = options.game;
	this.age = 0;
	
	var info = { 
		'density' : 10 ,
		'fixedRotation' : true ,
		'userData' : this ,
		'type' : b2Body.b2_staticBody ,
	};
	
	var body = create_box(this.game.box2d_world , this.x, this.y, this.width, this.height, info);
	this.body = body;
}

wall.img = img_res('wall.png');
wall.prototype.tick = function(){
	this.age++;
}

wall.prototype.draw = function(){												////Draw bricks
	var x1 = this.x - this.width/2;
	var x2 = this.x + this.width/2;
	var y1 = this.y + this.height/2;
	var y2 = this.y - this.height/2;
	
	var scale = this.game.scale;
	var width = 1.0 * scale;
	var height = 1.0 * scale;
	
	for(var i = x1 ; i < x2; i++){
		for(var j = y1; j > y2; j--){											//get canvas coordinates
			var c = this.game.get_offset(new b2Vec2(i,j));
			this.game.ctx.drawImage(wall.img , c.x * scale, c.y * scale, width, height);
		}
	}
}