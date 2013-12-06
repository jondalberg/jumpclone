var width = 320,
    height = 500,
    c = document.getElementById('c'),
    ctx = c.getContext('2d'),
    gLoop,
    points = 0,
    state = true,
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
  self.image.src = '/images/angel.png';
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
    if(self.Y > height * 0.4) {
      self.setPosition(self.X, self.Y - self.jumpSpeed);
    } else {
      if(self.jumpSpeed > 10) points++;
      moveCircles(self.jumpSpeed * 0.5);
      platforms.forEach(function(platform, ind) {
        platform.y += self.jumpSpeed;
        if(platform.y > height) {
          var type = ~~(Math.random() * 5);
          if(type === 0) {
            type = 1;
          } else {
            type = 0;
          }
          platforms[ind] = new Platform(Math.random() * (width - platformWidth), platform.y - height, type);
        }
      });
    }

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
      if(points === 0) {
        self.fallStop();
      } else {
        gameOver();
      }
    }
  };

  self.fallStop = function() {
    self.isFalling = false;
    self.fallSpeed = 0;
    self.jump();
  };

  self.moveLeft = function(dist){
    var dist = dist || 5;
    if(self.X > 0) {
      self.setPosition(self.X - dist, self.Y);
    }
  };

  self.moveRight = function(dist){
    var dist = dist || 5;
    if(self.X + self.width < width) {
      self.setPosition(self.X + dist, self.Y);
    }
  };
})();

var Platform = function(x,y,type) {
  var self = this;
  self.firstColor = '#ff8c00';
  self.secondColor = '#eeee00';
  self.onCollide = function(){
    player.fallStop();
    bounce_sounds.get();
  };

  if(type === 1) {
    self.firstColor = '#aadd00';
    self.secondColor = '#698b22';
    self.onCollide = function() {
      player.fallStop();
      player.jumpSpeed = 50;
      big_bounce_sounds.get();
    };
  }

  self.x = ~~x;
  self.y = y;
  self.type = type;
  
  self.isMoving = ~~(Math.random() *2);
  self.direction = ~~(Math.random() *2) ? -1 : 1;

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
};
generatePlatforms();

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

var drawScore = function(){
  ctx.fillStyle = 'black';
  ctx.fillText("POINTS: " + points, 10, height - 10);
};

var gameOver = function(){
  state = false;
  clearTimeout(gLoop);
  setTimeout(function(){
    clear();
    ctx.fillStyle = "black";
    ctx.font = "1opt Arial";
    ctx.fillText("GAME OVER", width/2 - 60, height/2 - 50);
    ctx.fillText("YOUR SCORE: " + points, width/2 - 60, height/2 - 30);
  }, 100);
  setTimeout(function(){
    points = 0;
    generatePlatforms();
    state = true;
    player.setPosition(~~((width - player.width)/2), ~~((height - player.height)/2));
    player.jump();
    gameLoop();
  }, 2000);
};

var gameLoop = function(){
  clear();
  
  drawCircles();

  if(player.isJumping) player.checkJump();
  if(player.isFalling) player.checkFall();

  player.draw();
  
  platforms.forEach(function(platform, index){
    if(platform.isMoving) {
      if(platform.x < 0) {
        platform.direction = 1;
      } else if (platform.x > width - platformWidth) {
        platform.direction = -1;
      }
      platform.x += platform.direction * (index/2) * ~~(points/100);
    }
    platform.draw();
  });

  checkCollision();

  drawScore();

  if(state) {
    gLoop = setTimeout(gameLoop, 1000/50); //FPS around 50
  }
};

var demo = function(){
  if(Math.random() > 0.5) {
    player.moveLeft(20);
  } else {
    player.moveRight(20);
  }
};

function SoundPool(maxSize) {
  var size = maxSize;
  var pool = [];
  this.pool = pool;
  var currSound = 0;

  this.init = function(object) {
    for(var i=0; i<size; i++) {
      bounce = new Audio("sounds/" + object + ".mp3");
      bounce.volume = 0.12;
      bounce.load();
      pool[i] = bounce;
    }
  };

  this.get = function() {
    if(!pool[currSound]){
      return;
    }
    if(pool[currSound].currentTime === 0 || pool[currSound].ended) {
      pool[currSound].play();
    }
    currSound = (currSound + 1) % size;
  };
}

var bounce_sounds = new SoundPool(5);
var big_bounce_sounds = new SoundPool(5);

var sounds_loaded = false;
var loadSounds = function() {
  if(!sounds_loaded) {
    bounce_sounds.init('bounce');
    big_bounce_sounds.init('big_bounce');
    sounds_loaded = true;
  }
};

var init = function() {
  gameLoop();
  setInterval(demo, 1000);
};

window.addEventListener('load', init, false);
c.addEventListener('mousemove', gameMove, false);
c.addEventListener('touchstart', function(e){
  e.preventDefault();
  loadSounds();
  gameMove(e.touches[0]);
}, false);
c.addEventListener('touchmove', function(e){
  e.preventDefault();
  gameMove(e.touches[0]);
}, false);
c.addEventListener('touchend', function(e){
  e.preventDefault();
  gameMove(e.touches[0]);
}, false);
c.addEventListener('click', function(e) {
  e.preventDefault();
  loadSounds();
}, false);

