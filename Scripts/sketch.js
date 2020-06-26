var p1, game, id, socket, arena, stars;
var isHost = false;

let params = new URLSearchParams(location.search);
let host = params.get('host');
let name = params.get('name');
socket = new WebSocket(`ws://${host}`);
//socket = new WebSocket(`ws://localhost:8765`);

function setup() {
  canvas = createCanvas(1200, 600);
  canvas.id('p5canvas');
  p1 = new Player(random(width, 1000), random(height, 1000), name, 0);
  arena = new Arena();
  game = new Game(p1, arena);
  stars = new Starsbg();
  createStartBT();
}

function draw() {
  background(0);
  stars.show();
  game.show();
  arena.show();
  gameUpdate();
  showHost();
}


//Controles

function keyPressed() {
  if (keyCode === 65) {
    p1.left = 1;
  } else if (keyCode === 68) {
    p1.right = 1;
  } else if (keyCode === 87) {
    p1.up = 1;
  } else if (keyCode === 83) {
    p1.down = 1;
  } else if (keyCode === 82) {
    if (isHost || (game.checkGameState() == 'End')) {
      game.sendReset(socket);
    }
  }
}

function keyReleased() {
  if (keyCode === 65) {
    p1.left = 0;
  } else if (keyCode === 68) {
    p1.right = 0;
  } else if (keyCode === 87) {
    p1.up = 0;
  } else if (keyCode === 83) {
    p1.down = 0;
  }
}

function mouseClicked() {
  game.addBullet(p1.shot());
}

//communication

socket.onopen = function () {
  console.log("[Open] Connection established");
  console.log("[Client] Sending hello to server");
  setTimeout(() => {
    socket.send(JSON.stringify({
      Action: 'hello',
      Arena: arena.reportToSend(),
    }));
  }, 100);
};

socket.onmessage = function (event) {
  //  let data = event.data;
  //Sets id
  if (event.data.includes('your_id')) {
    console.log(`[Server] ID Assigned ${event.data}`);
    id = event.data.slice(9);
    game.setId(id);
  }
  //Sets Arena
  if (event.data.includes('Arena')) {
    console.log(`[Server] Assigned Arena`);
    let newArena = JSON.parse(event.data);
    arena.setArena(newArena['Arena']);
    game.setArena(arena);
  }

  //Receive Updates from the server
  if (event.data.includes('Update') && id) {
    let dataObj = JSON.parse(event.data);
    game.setEnemys(dataObj, id);
  }
  //Reset Command
  if (event.data.includes('reset') && id) {
    game.reset()
  }
  if (event.data.includes('host') && id) {
    isHost = true;
  }
};

//Send Updates to the Server
function gameUpdate() {
  if (id) {
    let data = JSON.stringify({
      Action: 'update',
      Data: game.sendData(),
      Bullets: game.sendBulletData()
    });
    socket.send(data);
  }
}

function showHost() {
  if (isHost) {
    push();
    fill(250, 218, 94)
    stroke(0)
    textSize(30);
    text('HOST', width - 100, height - 20);
    pop();
  }
}

function createStartBT() {
  startBT = createButton('Join Game!');
  startBT.id('startBT');
  startBT.size(200, 70);
  startBT.mousePressed(playBG);


  function playBG() {
    var audio = new Audio('assets/game.mp3');
    audio.loop = true;
    audio.play();
    startBT.remove();
    p1.reset();
  }
}