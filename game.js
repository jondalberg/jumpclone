var width = 320,
    height = 500,
    c = document.getElementById('c'),
    ctx = c.getContext('2d'),
    gLoop,
    howManyCircles = 10,
    circles = [];

// circle has:
//  x, y, radius, transparency
for(var i=0; i<howManyCircles; i++) {
  circles.push([Math.random() * width, Math.random() * height, Math.random() * 100, Math.random() /2]);
}

c.width = width;
c.height = height;

var clear = function(){
  ctx.fillStyle = '#d0e7f9';
  ctx.beginPath();
  ctx.rect(0,0,width, height);
  ctx.closePath();
  ctx.fill();
};

var moveCircles = function(deltaY){
  for(var i=0; i<howManyCircles; i++){
    if(circles[i][1] - circles[i][2] > height) {
      circles[i][0] = Math.random() * width;
      circles[i][2] = Math.random() * 100;
      circles[i][1] = 0 - circles[i][2];
      circles[i][3] = Math.random() / 2;
    } else {
      circles [i][1] += deltaY;
    }
  }
};

var drawCircles = function(){
  for(var i=0; i<howManyCircles; i++) {
    // set transparency for fill
    ctx.fillStyle = 'rgba(255,255,255,' + circles[i][3] + ')';
    ctx.beginPath();
    // true for counter-clockwise
    ctx.arc(circles[i][0], circles[i][1], circles[i][2], 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
  }
};

var player = new(function(){
  var self = this;
  self.image = new Image();
  self.image.src = 'angel.png';
  self.width = 65;
  self.height = 95;
  self.X = 0;
  self.Y = 0;
  self.frames = 1; // # of frames
  self.actualFrame = 0; // start frame at 0
  self.interval = 0; // # draw every 4th interval
  self.isJumping = false;
  self.isFalling = false;
  self.jumpSpeed = 0;
  self.fallSpeed = 0;
  
  self.setPosition = function(x,y) {
    self.X = x;
    self.Y = y;
  };

  self.draw = function(){
    try {
      ctx.drawImage(self.image, 0, self.height * self.actualFrame, self.width, self.height, self.X, self.Y, self.width, self.height);
    } catch(e) {
      // we get here sometimes...
    }

    if(self.interval === 4) {
      if(self.actualFrame === self.frames) {
        self.actualFrame = 0;
      } else {
        self.actualFrame++;
      }
      self.interval = 0;
    }
    self.interval++;
  };
  
  self.jump = function(){
    if(!self.isJumping && !self.isFalling) {
      self.fallSpeed = 0;
      self.isJumping = true;
      self.jumpSpeed = 17;
    }
  };

  self.checkJump = function(){
    self.setPosition(self.X, self.Y - self.jumpSpeed);
    self.jumpSpeed--;
    if(self.jumpSpeed == 0) {
      self.isJumping = false;
      self.isFalling = true;
      self.fallSpeed = 1;
    }
  };

  self.checkFall = function(){
    if(self.Y < height - self.height) {
      self.setPosition(self.X, self.Y + self.fallSpeed);
      self.fallSpeed++;
    } else {
      self.fallStop();
    }
  };

  self.fallStop = function() {
    self.isFalling = false;
    self.fallSpeed = 0;
    self.jump();
  };

  self.moveLeft = function(){
    if(self.X > 0) {
      self.setPosition(self.X - 5, self.Y);
    }
  };

  self.moveRight = function(){
    if(self.X + self.width < width) {
      self.setPosition(self.X + 5, self.Y);
    }
  };
})();

var Platform = function(x,y,type) {
  var self = this;
  self.firstColor = '#ff8c00';
  self.secondColor = '#eeee00';
  self.onCollide = function(){
    player.fallStop();
  };

  if(type === 1) {
    self.firstColor = '#aadd00';
    self.secondColor = '#698b22';
    self.onCollide = function() {
      player.jumpSpeed = 50;
    };
  }

  self.x = ~~x;
  self.y = y;
  self.type = type;

  self.draw = function() {
    ctx.fillStyle = 'rgba(255,255,255,1)';
    var gradient = ctx.createRadialGradient(self.x + (platformWidth/2), self.y + (platformHeight/2), 5, self.x + (platformWidth/2), self.y + (platformHeight/2), 45);
    gradient.addColorStop(0, self.firstColor);
    gradient.addColorStop(1, self.secondColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(self.x, self.y, platformWidth, platformHeight);
  };

  return self;
};

var platforms = [];
var nrOfPlatforms = 7,
    platformWidth = 70,
    platformHeight = 20;      

var generatePlatforms = function() {
  var position = 0,
      type;

  for(var i=0; i<nrOfPlatforms; i++){
    type = ~~(Math.random() * 5);
    if(type === 0) {
      type = 1;
    } else {
      type = 0;
    }
    platforms[i] = new Platform(Math.random() * (width - platformWidth), position, type);
    if(position < height - platformHeight) {
      position += ~~(height / nrOfPlatforms);
    }
  }
}();

var checkCollision = function(){
  platforms.forEach(function(e, ind) {
    if(player.isFalling && (player.X < e.x + platformWidth) &&
      (player.X + player.width > e.x) &&
      (player.Y + player.height > e.y) &&
      (player.Y + player.height < e.y + platformHeight)) {
      e.onCollide();
    }
  });
};

player.setPosition(~~((width - player.width)/2), ~~((height - player.height)/2));
player.jump();

var gameMove = function(e) {
  if(player.X + c.offsetLeft > e.pageX) {
    player.moveLeft();
  } else if(player.X + c.offsetLeft < e.pageX) {
    player.moveRight();
  }
};

var gameLoop = function(){
  clear();
  
  //moveCircles(5);
  drawCircles();
  
  platforms.forEach(function(platform){
    platform.draw();
  });

  if(player.isJumping) player.checkJump();
  if(player.isFalling) player.checkFall();

  checkCollision();

  player.draw();
  
  gLoop = setTimeout(gameLoop, 1000/50); //FPS around 50
}
window.addEventListener('load', gameLoop, false);
window.addEventListener('mousemove', gameMove, false);

