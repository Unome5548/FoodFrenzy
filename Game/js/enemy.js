function Enemy(options){
	this.unitType = options.unitType;
	this.x = options.x;
	this.y = options.y;
	this.height = options.height;
	this.width = options.width;
	this.game = options.game;
	this.age = 0;
	if(this.unitType == "pizza"){
		this.health = 25;
		this.do_move_left = true;
	}
	else if(this.unitType == "meatball"){
		this.health = 20;
	}
	else if(this.unitType == "minimeatball"){
		this.health = 10;
	}
	
	this.max_hor_vel = .2 + Math.random() * 3 / 5 ;
	this.max_ver_vel = 3;

	var bodyType = b2Body.b2_kinematicBody;
	if(this.unitType == "minimeatball")bodyType = b2Body.b2_dynamicBody;
	var info = { 
		'density' : 1 ,
		'fixedRotation' : true ,
		'userData' : this ,
		'type' : bodyType ,
		'restitution' : 0.0 ,
		'friction': 1
	};

	if(this.unitType != "minimeatball")var body = create_box(this.game.box2d_world , this.x, this.y, this.width, this.height, info);
	else var body = create_circle(this.game.box2d_world, this.x, this.y, this.width, info);
	this.body = body;
	if(this.unitType == "minimeatball"){
		var degree = Math.random() * 180;
		var power = Math.random() * 3 + 1;
		this.body.ApplyImpulse(new b2Vec2(Math.cos(degree * Math.PI/ 180) * 1.5, Math.sin(degree * Math.PI/180) * power),  this.body.GetWorldCenter());

	}
}

Enemy.prototype.tick = function(){
	var xPos = this.game.get_offset(this.body.GetPosition()).x;
	var yPos = this.game.get_offset(this.body.GetPosition()).y;
	var yVel;
	if(this.unitType == "pizza"){
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
		if(this.game.time_elapsed % 125 == 0){											//create a random object on top
			this.game.game_objects.push(new enemyProjectile({x : xPos, y : this.body.GetPosition().y - this.height/2  ,game:this.game}));
		}
	}
	else if(this.unitType == "meatball"){
		this.add_velocity(new b2Vec2(0, -.1));
		if(yPos > 12){
			this.game.game_objects.push(new Enemy({x: xPos, y: 1, width: .75, height: .75, unitType: "minimeatball", game: this.game}))
			this.game.game_objects.push(new Enemy({x: xPos, y: 1, width: .75, height: .75, unitType: "minimeatball", game: this.game}))
			this.game.game_objects.push(new Enemy({x: xPos, y: 1, width: .75, height: .75, unitType: "minimeatball", game: this.game}))
			this.game.to_destroy.push(this);
		}
	}
	else if(this.unitType == "minimeatball"){
		var playerX = this.game.player.body.GetPosition().x
		var direction = 1;
		if(playerX < this.body.GetPosition().x)direction = -1;
		var randPower = Math.random() * 5 + 1;
		if(this.game.time_elapsed % 50 == 0){
			this.body.ApplyImpulse(new b2Vec2(Math.cos(30 * Math.PI/ 180) * 1 * direction, Math.sin(30 * Math.PI/180) * randPower),  this.body.GetWorldCenter());
		}
	}

	if(this.health <= 0){
		this.game.to_destroy.push(this);
	}
	
	this.age++;
}

Enemy.prototype.getUnitType = function(){
	return this.unitType;
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
Enemy.img2 = img_res('bigmeat.gif');
Enemy.img3 = img_res('littlemeat.gif');

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
	if(this.unitType == "pizza")this.game.ctx.drawImage(Enemy.img , -width / 2, -height / 2, width, height);
	if(this.unitType == "meatball")this.game.ctx.drawImage(Enemy.img2 , -width / 2, -height / 2, width, height);
	if(this.unitType == "minimeatball")this.game.ctx.drawImage(Enemy.img3 , -width / 2, -height / 2, width, height);

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
