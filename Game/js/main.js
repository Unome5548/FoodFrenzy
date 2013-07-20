 var app= angular.module("myApp", [])



function myCtrl($scope){
	var imageObj = img_res('assets/tacoSmall.png');
	var imageWidth = imageObj.width;
	var imageHeight = imageObj.height;
	var canvas = document.getElementById('canvas1');
	var game = new Game();
	var scale = 1;
	var hoverItem = {id: 0};
	var defaultWidth = 800;
	var defaultHeight = 400;

	$scope.player;
	objects = [];

	function start_canvas(){
		game.setup();
	}

	imageObj.onload = function(){
		start_canvas();
	}

	function Game(){
		
	}

	Game.prototype.setup = function(){
		// getScale();
		this.ctx = canvas.getContext('2d');
		objects.push(new Player(50, 50, 1, this));

		for(var i in objects){
			objects[i].draw();
		}
		$scope.player = objects[0];
	}

	function getScale(){
		var screenWidth = $(window).outerWidth();
		var screenHeight = $(window).outerHeight();
		scale = (screenWidth * .5) / defaultWidth;
		canvas.width = defaultWidth * scale;
		canvas.height = defaultHeight * scale;
	}

	Game.prototype.redraw = function(){
		this.ctx.clearRect(0,0,canvas.width, canvas.height);
		for(var i in objects){
			objects[i].draw();
		}
	}

	function Player(xPos, yPos, id, game){
		this.x = xPos;
		this.y = yPos;
		this.width = imageObj.width;
		this.height = imageObj.height;
		this.myId = id;
		this.game = game;
		
	}

	function img_res(path){
		var i = new Image();
		i.src = path;
		
		return i;
	}

	Player.prototype.getInfo = function(){
		return {x: this.x, y: this.y, width: this.width, height: this.height, id: this.myId}
	}

	Player.prototype.draw = function(){
		var buttonColor;
		if(this.status == 1)this.game.ctx.fillStyle = busyColor;
		// this.game.ctx.fillRect(this.x, this.y, this.width, this.height);
		this.game.ctx.fillStyle = 'black';
		this.game.ctx.lineWidth = 1;
		this.game.ctx.strokeRect(this.x, this.y, this.width, this.height);
		this.game.ctx.drawImage(imageObj, this.x, this.y, this.width * scale, this.height * scale);
	}

	function getMousePos(canvas, evt) {
	    var rect = canvas.getBoundingClientRect();
	    return {
	      x: evt.clientX - rect.left,
	      y: evt.clientY - rect.top
	    };
	  }

	canvas.addEventListener('mousemove', function(evt) {
		var bool = false;
		var buttonPos;
        var mousePos = getMousePos(canvas, evt);
        for(var i = 0; !bool && i < objects.length; i++){
    		buttonPos = objects[i].getInfo();
        	if(mousePos.x > buttonPos.x && mousePos.x < (buttonPos.x + buttonPos.width) && mousePos.y > buttonPos.y && mousePos.y < (buttonPos.y + buttonPos.height)){
    			$('body').css('cursor','pointer');
    			bool = true;
    			if(hoverItem.id != buttonPos.myId){
    				hoverItem.id = buttonPos.id;
    				game.redraw();
    			}
        	}
        	else{
				$('body').css('cursor','default');
				game.redraw();
				hoverItem.id = 0;
    		}
        }
      }, false);

	canvas.addEventListener('click', function(evt) {
		var bool = false;
		var buttonPos;
        var mousePos = getMousePos(canvas, evt);
        for(var i = 0; !bool && i < objects.length; i++){
    		buttonPos = objects[i].getInfo();
        	if(mousePos.x > buttonPos.x && mousePos.x < (buttonPos.x + buttonPos.width) && mousePos.y > buttonPos.y && mousePos.y < (buttonPos.y + buttonPos.height)){
        		//click
        	}
        }
        $scope.player.x += 2;
      }, false);

	function checkKey(e) {
	    var event = window.event ? window.event : e;
	    if (true) {
	        alert(event.keyCode)
	    }
	}

	canvas.addEventListener('keydown', function(e) {
		console.log("AG");
	   if(e.keycode == 37) $scope.player.x += 2;
	   if(e.keycode == 39) $scope.player.x += 2;
	}, false);


	$(window).resize(function() {
		// getScale();
	  	game.redraw();
	});
}



 