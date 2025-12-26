// npm install phaser@latest
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import './App.css'; // Optional: Add basic styles if needed


function App() {
  const gameRef = useRef(null);


  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 300 },
          debug: false
        }
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%'
      },      
      scene: {
        preload: preload,
        create: create,
        update: update
      },
      parent: 'phaser-game'
    };


    const game = new Phaser.Game(config);
    gameRef.current = game;


    let player;
    let platforms;
    let coins;
    let enemies;
    let cursors;
    let score = 0;
    let scoreText;
    let gameOver = false;


    function preload() {
      // No external assets needed; textures generated in create()
    }


    function create() {
      // Generate textures for colored shapes
      generateTextures(this);


      // Background
      this.add.rectangle(400, 300, 800, 600, 0x87CEEB); // Sky blue


      // Platforms group
      platforms = this.physics.add.staticGroup();
      platforms.create(400, 568, 'greenTexture').setScale(8, 0.64).refreshBody(); // Ground (scaled for width)
      platforms.create(600, 400, 'greenTexture').setScale(2, 0.2).refreshBody(); // Platform
      platforms.create(50, 250, 'greenTexture').setScale(1.5, 0.2).refreshBody(); // Platform
      platforms.create(750, 220, 'greenTexture').setScale(1, 0.2).refreshBody(); // Platform


      // Player
      player = this.physics.add.sprite(100, 450, 'blueTexture');
      player.setScale(0.32, 0.48); // Adjust size (original texture is 100x100)
      player.setBounce(0.2);
      player.setCollideWorldBounds(true);


      // Coins group
      coins = this.physics.add.group({
        key: 'yellowTexture',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
      });
      coins.children.iterate((child) => {
        child.setScale(0.2); // Small coins
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      });


      // Enemies group
      enemies = this.physics.add.group();
      createEnemy(this, 500, 500);
      createEnemy(this, 700, 200);


      // Score text
      scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });


      // Collisions
      this.physics.add.collider(player, platforms);
      this.physics.add.collider(coins, platforms);
      this.physics.add.collider(enemies, platforms);
      this.physics.add.overlap(player, coins, collectCoin, null, this);
      this.physics.add.collider(player, enemies, hitEnemy, null, this);


      // Input
      cursors = this.input.keyboard.createCursorKeys();

      // Detect if mobile/touch device
      const isMobile = !this.sys.game.device.os.desktop || this.sys.game.device.input.touch;

      if (isMobile) {
        // Virtual buttons with relative positioning
        const buttonY = this.scale.height - 100; // Bottom of screen
        const leftButton = this.add.rectangle(100, buttonY, 100, 100, 0x000000, 0.5).setInteractive().setDepth(10); // Depth to ensure on top
        const rightButton = this.add.rectangle(250, buttonY, 100, 100, 0x000000, 0.5).setInteractive().setDepth(10);
        const jumpButton = this.add.rectangle(this.scale.width - 100, buttonY, 100, 100, 0x000000, 0.5).setInteractive().setDepth(10);

        // Touch events (hold for continuous movement)
        this.input.on('pointerdown', (pointer) => {
          if (leftButton.getBounds().contains(pointer.x, pointer.y)) {
            player.setVelocityX(-160);
          } else if (rightButton.getBounds().contains(pointer.x, pointer.y)) {
            player.setVelocityX(160);
          } else if (jumpButton.getBounds().contains(pointer.x, pointer.y) && player.body.touching.down) {
            player.setVelocityY(-330);
          }
        });

        this.input.on('pointerup', () => {
          player.setVelocityX(0); // Stop horizontal movement on release
        });
      }      
      // // Virtual buttons (simple rectangles for touch)
      // const leftButton = this.add.rectangle(100, 500, 100, 100, 0x000000, 0.5).setInteractive();
      // const rightButton = this.add.rectangle(250, 500, 100, 100, 0x000000, 0.5).setInteractive();
      // const jumpButton = this.add.rectangle(700, 500, 100, 100, 0x000000, 0.5).setInteractive();

      // // Touch events
      // leftButton.on('pointerdown', () => player.setVelocityX(-160));
      // leftButton.on('pointerup', () => player.setVelocityX(0));
      // rightButton.on('pointerdown', () => player.setVelocityX(160));
      // rightButton.on('pointerup', () => player.setVelocityX(0));
      // jumpButton.on('pointerdown', () => {
      //   if (player.body.touching.down) player.setVelocityY(-330);
      // });


    }

    function update() {
      if (gameOver) return;

      // Keyboard controls (as before)
      if (cursors.left.isDown) {
        player.setVelocityX(-160);
      } else if (cursors.right.isDown) {
        player.setVelocityX(160);
      } else if (!this.input.pointer1.isDown) { // Prevent sticking if touch ends
        player.setVelocityX(0);
      }

      if (cursors.space.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
      }
    }

    // function update() {
    //   if (gameOver) return;


    //   // Player movement
    //   if (cursors.left.isDown) {
    //     player.setVelocityX(-160);
    //   } else if (cursors.right.isDown) {
    //     player.setVelocityX(160);
    //   } else {
    //     player.setVelocityX(0);
    //   }


    //   if (cursors.space.isDown && player.body.touching.down) {
    //     player.setVelocityY(-330);
    //   }


    //   // Win condition (reach right side with enough score)
    //   if (player.x > 750 && score >= 10) {
    //     this.add.text(300, 250, 'You Win!', { fontSize: '64px', fill: '#00FF00' });
    //     gameOver = true;
    //   }
    // }


    function collectCoin(player, coin) {
      coin.disableBody(true, true);
      score += 1;
      scoreText.setText('Score: ' + score);
    }


    function hitEnemy(player, enemy) {
      this.physics.pause();
      player.setTint(0xff0000);
      this.add.text(300, 250, 'Game Over!', { fontSize: '64px', fill: '#FF0000' });
      gameOver = true;
    }


    function createEnemy(scene, x, y) {
      const enemy = enemies.create(x, y, 'redTexture');
      enemy.setScale(0.32);
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
      enemy.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }


    function generateTextures(scene) {
      // Helper to create colored textures
      const colors = {
        blue: 0x0000FF,
        green: 0x228B22,
        yellow: 0xFFD700,
        red: 0xFF0000
      };


      Object.keys(colors).forEach((key) => {
        const graphics = scene.add.graphics();
        graphics.fillStyle(colors[key], 1);
        graphics.fillRect(0, 0, 100, 100); // Base size; scale later
        graphics.generateTexture(`${key}Texture`, 100, 100);
        graphics.destroy();
      });
    }


    return () => {
      game.destroy(true);
    };
  }, []);


  return (
    <div>
      <h1>Mario-Like Game in React</h1>
      <div id="phaser-game" style={{ width: '800px', height: '600px', margin: 'auto' }} />
    </div>
  );
}


export default App;
