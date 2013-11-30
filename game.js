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

  self.setPosition = function(x,y) {
    self.X = x;
    self.Y = y;
  };

  self.draw = function(){
    try {
      ctx.drawImage(self.image, 0, 0, self.width, self.height, self.X, self.Y, self.width, self.height);
    } catch(e) {
      // we get here sometimes...
    }
  };
})();

player.setPosition(~~((width - player.width)/2), ~~((height - player.height)/2));

var gameLoop = function(){
  clear();
  moveCircles(5);
  drawCircles();
  player.draw();
  gLoop = setTimeout(gameLoop, 1000/50); //FPS around 50
}
window.addEventListener('load', gameLoop, false);
