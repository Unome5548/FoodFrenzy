function playerBullet(options){
	this.height = 0.5;
	this.width = 0.25;
	this.x = options.x;
	this.y = options.y;
	this.angle = options.angle;
	this.game = options.game;
	this.direction = options.direction;
	this.img = img_res('hot-pepper-bullet.gif');

	var info = { 
		'density' : 5 ,
		'fixedRotation' : true ,
		'userData' : this ,
		'type' : b2Body.b2_dynamicBody,
		'bullet': true
	};
	
	var body = create_box(this.game.box2d_world , this.x, this.y, this.width, this.height, info);
	this.body = body;
	this.body.ApplyImpulse(new b2Vec2(Math.cos(this.angle) * 7 * this.direction, Math.sin(this.angle) * 7),  this.body.GetWorldCenter());
}

playerBullet.prototype.draw = function(){
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
	this.game.ctx.rotate(this.angle * this.direction);
	this.game.ctx.drawImage(this.img , -width / 2, -height / 2, width, height);
	this.game.ctx.rotate(-this.angle * this.direction);
	this.game.ctx.translate(-sx, -sy);
}

playerBullet.prototype.tick = function(){
	this.age++;
	
	if(this.body.GetPosition().y > this.game.screen_height){											//destroy the enemyProjectile if it falls below the x axis
		this.game.destroy_object(this);
		console.log("Object gone");
	}
}


playerBullet.prototype.destroy = function(){											//Destroy the enemyProjectile when player eats it
	if(this.body == null){
		return;
	}
	this.body.GetWorld().DestroyBody( this.body );
	this.body = null;
	this.dead = true;
}
