function preload(){
  this.load.image("spieler", "./bilder/spieler.png");
  this.load.image("gegner", "./bilder/gegner.png");
  this.load.image("platform", "./bilder/platform.png");
  this.load.image("attacke", "./bilder/attacke2.png");
  this.load.image("verteidigung", "./bilder/verteidigung2.png");
  this.load.image("background", "./bilder/weltraum.png");
}

function numOfTotalEnemies() {
	const totalEnemies = gameState.enemies.getChildren().length;
  return totalEnemies;
}

function sortedEnemies(coord){
  if (coord === "y"){
    const orderedByYCoord = gameState.enemies.getChildren().sort((a, b) => a.y - b.y);
    return orderedByYCoord;
  }
  else if (coord === "x") {
    const orderedByXCoord = gameState.enemies.getChildren().sort((a, b) => a.x - b.x);
    return orderedByXCoord;
  }
}

const gameState = { score: 0,
                    enemyVelocity: 1 };

function create(){
  gameState.cursors = this.input.keyboard.createCursorKeys();
  const backG = this.add.image(250,200,"background");

  gameState.scoreText = this.add.text(250,380,"Score: 0", {fontSize: "12px", fill:"#ffe400"});

  gameState.player = this.physics.add.sprite(75,200,"spieler").setScale(.04);
  gameState.player.setCollideWorldBounds(true);

  const platform = this.physics.add.staticGroup();
  platform.create(-5,200,"platform");

  this.physics.add.collider(gameState.player, platform);

  gameState.enemies = this.physics.add.group();
  for (let xC = 1; xC < 4; xC++){
    for (let yC = 1; yC < 8; yC++){
      gameState.enemies.create(xC*50+350,yC*50,"gegner").setScale(.03).setGravityX(200);
    }
  }

  const attacks = this.physics.add.group();
  function attackGen(){
    let randomEnemy = Phaser.Utils.Array.GetRandom(gameState.enemies.getChildren());
    attacks.create(randomEnemy.x,randomEnemy.y,"attacke");
  }

  gameState.attackLoop = this.time.addEvent({
    delay: 200,
    callback: attackGen,
    callbackScope: this,
    loop: true
  });

  this.physics.add.collider(attacks, platform, (attack)=>{
    attack.destroy();
  });

  this.physics.add.collider(attacks, gameState.player, (attack)=>{
    gameState.attackLoop.destroy();
    gameState.enemyVelocity = 0;
    this.physics.pause();
    this.add.text(235,225,"GAME OVER!", {fontSize: "15px", fill:"#ffe400"});
  });

  gameState.defends = this.physics.add.group();

  this.physics.add.collider(gameState.defends, gameState.enemies, (defend,enemy)=>{
    defend.destroy();
    enemy.destroy();
    gameState.score += 10;
    gameState.scoreText.setText(`Score: ${gameState.score}`);
  });

  this.physics.add.collider(gameState.enemies, gameState.player, ()=>{
    gameState.attackLoop.destroy();
    gameState.enemyVelocity = 0;
    this.physics.pause();
    this.add.text(235,225,"GAME OVER!", {fontSize: "15px", fill:"#ffe400"});
  })

  this.input.on("pointerup", ()=>{
    gameState.score = 0;
    gameState.enemyVelocity = 1;
    this.scene.restart();
  })
}

function update(){
  if (gameState.cursors.up.isDown){
    gameState.player.setVelocityY(-160);
  } else if (gameState.cursors.down.isDown){
    gameState.player.setVelocityY(160);
  } else {
    gameState.player.setVelocityY(0);
  }

  if(Phaser.Input.Keyboard.JustDown(gameState.cursors.space)){
    gameState.defends.create(gameState.player.x, gameState.player.y,"verteidigung").setGravityX(400);
  }

  if (numOfTotalEnemies()===0){
    this.physics.pause();
    this.add.text(235,225,"YOU WIN!", {fontSize: "15px", fill:"#ffe400"});
  } else {
    gameState.enemies.getChildren().forEach((enemy)=>{
      enemy.y += gameState.enemyVelocity;
    });
    gameState.lowest = sortedEnemies("y")[0];
    gameState.highest = sortedEnemies("y")[sortedEnemies("y").length-1];
    gameState.rightMost = sortedEnemies("x")[sortedEnemies("x").length-1];

    if (gameState.lowest.y < 10 || gameState.highest.y > 390){
      gameState.enemyVelocity *= -1;
      gameState.enemies.getChildren().forEach((enemy)=>{
        enemy.x -= 10;
    });
   }

   gameState.rightMost = sortedEnemies("x")[sortedEnemies("x").length-1];
   if (gameState.rightMost.x === 450){
     if (gameState.lowest.y === 50){
     for (let yCoord = 1; yCoord < 8; yCoord++){
       gameState.enemies.create(500,yCoord*50,"gegner").setScale(.03).setGravityX(200);
     }
    }
   }
   
  }

}


const config = {
  type: Phaser.AUTO,
  width: 550,
  height: 400,
  backgroundColor: "b9eaff",

  physics: {
    default: "arcade",
    arcade: {
      gravity: {x: -200},
      enableBody: true
    }
  },

  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);
