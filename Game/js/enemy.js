function Enemy(options){
	this.x = options.x;
	this.y = options.y;
	this.height = options.height;
	this.width = options.width;
	this.game = options.game;
	this.age = 0;
	this.health = options.health;
	this.do_move_left = true;
	this.max_hor_vel = .2 + Math.random() * 3 / 5 ;
	this.max_ver_vel = 2;

	var info = { 
		'density' : 1 ,
		'fixedRotation' : true ,
		'userData' : this ,
		'type' : b2Body.b2_kinematicBody ,
		'restitution' : 0.0 ,
	};

	var body = create_box(this.game.box2d_world , this.x, this.y, this.width, this.height, info);
	this.body = body;
}

Enemy.prototype.tick = function(){
	var xPos = this.game.get_offset(this.body.GetPosition()).x;
	var yPos = this.game.get_offset(this.body.GetPosition()).y;
	var yVel;
	if(xPos < 2){
		this.do_move_left = false;
		this.do_move_right = true;
	}
	else if(xPos > 16.75){
		this.do_move_right = false;
		this.do_move_left = true;
	}
	if(yPos  < 2)yVel = 0;
	else yVel = .5;
	if(this.do_move_left){
		this.add_velocity(new b2Vec2(-.05, 0));
	}
	
	if(this.do_move_right){
		this.add_velocity(new b2Vec2(.05,0));
	}

	if(this.game.time_elapsed % 50 == 0){											//create a random object on top
		this.game.game_objects.push(new enemyProjectile({x : xPos, y : this.body.GetPosition().y - this.height/2  ,game:this.game}));
	}

	if(this.health <= 0){
		this.game.destroy_object(this);
	}
	
	this.age++;
}

Enemy.prototype.add_velocity = function(vel){
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

Enemy.img = img_res('pizza.gif');

Enemy.prototype.draw = function(){
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
	this.game.ctx.drawImage(Enemy.img , -width / 2, -height / 2, width, height);
	this.game.ctx.translate(-sx, -sy);
}

Enemy.prototype.takeDamage = function(dmg){
	this.health -= dmg;
}

Enemy.prototype.destroy = function(){											//Destroy the enemyProjectile when player eats it
	if(this.body == null){
		return;
	}
	this.body.GetWorld().DestroyBody( this.body );
	this.body = null;
	this.dead = true;
}
