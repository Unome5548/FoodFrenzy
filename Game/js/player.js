function player(options){
	this.height = 2;
	this.width = 3.0;
	
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
		this.add_velocity(new b2Vec2(0,8));
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

player.prototype.shoot = function(mouseV){
	var playerV = this.body.GetPosition();
	var direction = 1;
	var difX = mouseV.x - playerV.x;
	var difY = mouseV.y - playerV.y ;
	if(difX < 0){
		difX = Math.abs(difX)
		direction = -1;
	}
	var angle = Math.atan(difY/difX);

	this.game.game_objects.push(new playerBullet({x : playerV.x, y : playerV.y, angle: angle, direction: direction, game:this.game}));
}

player.prototype.is_out = function(){											//if player has fallen below the 0 level of y axis in the box2d coordinates, then he is out
	if(this.body.GetPosition().y < 0){
		return true;
	}
	return false;
}
