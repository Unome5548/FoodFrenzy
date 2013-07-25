function enemyProjectile(options){
	this.height = 0.25;
	this.width = 0.25;
	this.x = options.x;
	this.y = options.y;
	this.game = options.game;
	this.img = img_res('pepperoni.gif');

	
	var linear_damping = 2;
	
	var info = { 
		'density' : 10 ,
		'linearDamping' : linear_damping ,
		'fixedRotation' : true ,
		'userData' : this ,
		'type' : b2Body.b2_kinematicBody,
	};
	
	var body = create_box(this.game.box2d_world , this.x, this.y, this.width, this.height, info);
	this.body = body;
}

enemyProjectile.prototype.draw = function(){
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
	this.game.ctx.drawImage(this.img , -width / 2, -height / 2, width, height);
	this.game.ctx.translate(-sx, -sy);
}

enemyProjectile.prototype.tick = function(){
	this.age++;
	
	if(this.body.GetPosition().y < 0){											//destroy the enemyProjectile if it falls below the x axis
		this.game.destroy_object(this);
	}
	this.add_velocity(new b2Vec2(0, -.05));
}


enemyProjectile.prototype.destroy = function(){											//Destroy the enemyProjectile when player eats it
	if(this.body == null){
		return;
	}
	this.body.GetWorld().DestroyBody( this.body );
	this.body = null;
	this.dead = true;
}

enemyProjectile.prototype.add_velocity = function(vel){
	var b = this.body;
	var v = b.GetLinearVelocity();
	
	v.Add(vel);																	//check for max horizontal and vertical velocities and then set

	if(Math.abs(v.y) > 3){
		v.y = 3 * v.y/Math.abs(v.y);
	}
	if(Math.abs(v.x) > 3){
		v.x = 3 * v.x/Math.abs(v.x);
	}
	
	b.SetLinearVelocity(v);														//set the new velocity
}