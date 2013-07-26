function enemyProjectile(options){
	this.height = 0.4;
	this.width = 0.4;
	this.x = options.x;
	this.y = options.y;
	this.game = options.game;
	this.img = img_res('pepperoni.gif');

	
	var linear_damping = 3.5;
	
	var info = { 
		'density' : .25 ,
		'linearDamping' : linear_damping ,
		'friction' : 0,
		'userData' : this ,
		'type' : b2Body.b2_dynamicBody,
	};
	
	var body = create_circle(this.game.box2d_world , this.x, this.y, this.width, info);
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
	if(this.body.GetPosition().y <= .5){											//destroy the enemyProjectile if it falls below the x axis
		this.game.to_destroy.push(this);
	}
	
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