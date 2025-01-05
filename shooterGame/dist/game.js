"use strict";
class Vector2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(other) {
        return new Vector2D(this.x + other.x, this.y + other.y);
    }
    multiply(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalize() {
        const mag = this.magnitude();
        return mag > 0
            ? new Vector2D(this.x / mag, this.y / mag)
            : new Vector2D(0, 0);
    }
}
// Canvas class
class Canvas {
    constructor() {
        this.canvas = document.getElementById("canvas");
        if (this.canvas)
            this.ctx = this.canvas.getContext("2d");
        this.width = 1400;
        this.height = 700;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }
    initCanvas() {
        if (this.ctx) {
            this.ctx.fillStyle = "gray";
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
    }
    drawRect(position, width, height, color) {
        if (this.ctx) {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(position.x, position.y, width, height);
        }
    }
    drawCircle(position, radius, color) {
        if (this.ctx) {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    drawStroke(position, width, height, color) {
        if (this.ctx) {
            this.ctx.strokeStyle = color;
            this.ctx.strokeRect(position.x, position.y, width, height);
        }
    }
    drawText(text, position, color) {
        if (this.ctx) {
            this.ctx.fillStyle = color;
            this.ctx.font = "20px Arial";
            this.ctx.fillText(text, position.x, position.y);
        }
    }
    getCanvas() {
        return this.canvas;
    }
    getWidth() {
        return this.width;
    }
    getHeight() {
        return this.height;
    }
}
class Bullet {
    constructor(position, direction) {
        this.position = position;
        this.hasCollided = 0;
        this.direction = direction;
        this.radius = 5;
    }
    getBullet() {
        return this;
    }
    getPosition() {
        return this.position;
    }
    getRadius() {
        return this.radius;
    }
    update(deltaTime, canvasWidth, canvasHeight) {
        // This function is called every frame
        const speed = 1000;
        this.position = new Vector2D(this.position.x + speed * this.direction.x * deltaTime, this.position.y + speed * this.direction.y * deltaTime);
        // Boundary check and reflection
        if (
        // Check if collide left and right
        this.position.x - this.radius < 0 ||
            this.position.x + this.radius > canvasWidth) {
            this.hasCollided += 1;
            this.direction = new Vector2D(-this.direction.x, this.direction.y);
        }
        if (
        // Check if collide top and bot
        this.position.y - this.radius < 0 ||
            this.position.y + this.radius > canvasHeight) {
            this.hasCollided += 1;
            this.direction = new Vector2D(this.direction.x, -this.direction.y);
        }
    }
    getCollideTime() {
        return this.hasCollided;
    }
    checkCollision(player) {
        const bulletLeft = this.position.x - this.radius;
        const bulletRight = this.position.x + this.radius;
        const bulletTop = this.position.y - this.radius;
        const bulletBottom = this.position.y + this.radius;
        const playerLeft = player.getPosition().x;
        const playerRight = player.getPosition().x + player.getWidth();
        const playerTop = player.getPosition().y;
        const playerBottom = player.getPosition().y + player.getHeight();
        return (bulletRight > playerLeft &&
            bulletLeft < playerRight &&
            bulletBottom > playerTop &&
            bulletTop < playerBottom &&
            this.hasCollided >= 1);
    }
}
class Player {
    constructor(position) {
        this.id = Math.random() * 1000;
        this.currentHP = 10;
        this.maxHP = 10;
        this.position = position;
        this.currentVelocity = new Vector2D(0, 0);
        this.maxVelocity = 400;
        this.acceleration = 1000;
        this.friction = 0.95;
        this.input = new Vector2D(0, 0);
        this.isShooting = false;
        this.width = 50;
        this.height = 50;
        this.color = "blue";
    }
    getPlayer() {
        return this;
    }
    getPosition() {
        return this.position;
    }
    getWidth() {
        return this.width;
    }
    getHeight() {
        return this.height;
    }
    setInput(direction) {
        this.input = direction;
    }
    reduceHP(amount) {
        this.currentHP -= amount;
        // this.color = "green";
        if (this.currentHP < 0)
            this.currentHP = 0;
    }
    getCurrentHP() {
        return this.currentHP;
    }
    getMaxHP() {
        return this.maxHP;
    }
    getColor() {
        return this.color;
    }
    update(deltaTime, canvasWidth, canvasHeight) {
        // This function is called every frame
        // -------------------------------------
        // Normalize input if it exists
        if (this.input.magnitude() > 0) {
            const normalizedInput = this.input.normalize();
            // Apply acceleration
            const acceleration = normalizedInput.multiply(this.acceleration * deltaTime);
            this.currentVelocity = new Vector2D(this.currentVelocity.x + acceleration.x, this.currentVelocity.y + acceleration.y);
            // Limit to max velocity
            const currentSpeed = this.currentVelocity.magnitude();
            if (currentSpeed > this.maxVelocity) {
                const normalized = this.currentVelocity.normalize();
                this.currentVelocity = new Vector2D(normalized.x * this.maxVelocity, normalized.y * this.maxVelocity);
            }
        }
        else {
            // Apply friction when no input
            this.currentVelocity = new Vector2D(this.currentVelocity.x * this.friction, this.currentVelocity.y * this.friction);
            // Stop completely if very slow
            if (this.currentVelocity.magnitude() < 0.1) {
                this.currentVelocity = new Vector2D(0, 0);
            }
        }
        // Update position
        this.position = new Vector2D(this.position.x + this.currentVelocity.x * deltaTime, this.position.y + this.currentVelocity.y * deltaTime);
        // Boundary check
        if (this.position.x < 0)
            this.position.x = 0;
        if (this.position.y < 0)
            this.position.y = 0;
        if (this.position.x + this.width > canvasWidth)
            this.position.x = canvasWidth - this.width;
        if (this.position.y + this.height > canvasHeight)
            this.position.y = canvasHeight - this.height;
    }
    shoot(mousePosition) {
        const playerCenter = new Vector2D(this.position.x + this.width / 2, this.position.y + this.height / 2);
        const direction = mousePosition
            .add(new Vector2D(-playerCenter.x, -playerCenter.y))
            .normalize();
        const bullet = new Bullet(playerCenter, direction);
        this.isShooting = true;
        return bullet;
    }
}
class Enemy {
    constructor() {
        this.position = null;
        this.speed = 0.5;
        this.playerToFollow = null;
        this.hp = 10;
    }
    followPlayer(player) {
        this.playerToFollow = player;
    }
    setPosition(pos) {
        this.position = new Vector2D(pos.x, pos.y);
    }
    getPosition() {
        if (this.position)
            return this.position;
    }
    update() {
        if (this.playerToFollow && this.position) {
            const playerPos = this.playerToFollow.getPosition();
            const direction = playerPos
                .add(new Vector2D(-this.position.x, -this.position.y))
                .normalize();
            const speed = this.speed;
            this.position = new Vector2D(this.position.x + direction.x * speed, this.position.y + direction.y * speed);
        }
    }
}
class Game {
    constructor() {
        var _a;
        this.canvas = new Canvas();
        this.canvas.initCanvas();
        this.players = [];
        this.enemies = [];
        this.lastTime = 0;
        this.keysPressed = {};
        this.bullets = [];
        setInterval(() => {
            this.spawnEnemy();
        }, 10000);
        window.addEventListener("keydown", (event) => {
            this.keysPressed[event.key.toLowerCase()] = true;
            this.updatePlayerInput();
        });
        window.addEventListener("keyup", (event) => {
            this.keysPressed[event.key.toLowerCase()] = false;
            this.updatePlayerInput();
        });
        (_a = this.canvas.getCanvas()) === null || _a === void 0 ? void 0 : _a.addEventListener("click", (event) => {
            if (this.players.length === 0)
                return;
            const canvasElement = this.canvas.getCanvas();
            if (canvasElement) {
                const canvasRect = canvasElement.getBoundingClientRect();
                const mouseX = event.clientX - canvasRect.left;
                const mouseY = event.clientY - canvasRect.top;
                const mousePosition = new Vector2D(mouseX, mouseY);
                const newBullet = this.players[0].shoot(mousePosition);
                this.bullets.push(newBullet);
            }
        });
    }
    updatePlayerInput() {
        if (this.players.length === 0)
            return;
        let x = 0;
        let y = 0;
        if (this.keysPressed["w"])
            y -= 1;
        if (this.keysPressed["s"])
            y += 1;
        if (this.keysPressed["a"])
            x -= 1;
        if (this.keysPressed["d"])
            x += 1;
        this.players[0].setInput(new Vector2D(x, y));
    }
    addPlayer(newPlayer) {
        this.players.push(newPlayer);
        this.spawnEnemy();
    }
    spawnEnemy() {
        const player = this.players[0];
        const minDistance = 500; // Spawn far away from the player
        let newEnemyPosition;
        do {
            newEnemyPosition = new Vector2D(Math.random() * this.canvas.getWidth(), Math.random() * this.canvas.getHeight());
        } while (newEnemyPosition
            .add(new Vector2D(-player.getPosition().x, -player.getPosition().y))
            .magnitude() < minDistance);
        const newEnemy = new Enemy();
        newEnemy.followPlayer(player);
        newEnemy.setPosition(newEnemyPosition);
        this.enemies.push(newEnemy);
    }
    //   ____    _    __  __ _____   _     ___   ___  ____
    //  / ___|  / \  |  \/  | ____| | |   / _ \ / _ \|  _ \
    // | |  _  / _ \ | |\/| |  _|   | |  | | | | | | | |_) |
    // | |_| |/ ___ \| |  | | |___  | |__| |_| | |_| |  __/
    //  \____/_/   \_\_|  |_|_____| |_____\___/ \___/|_|
    gameLoop(currentTime) {
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;
        this.canvas.initCanvas();
        // Draw players
        this.players.forEach((player) => {
            player.update(deltaTime, this.canvas.getWidth(), this.canvas.getHeight());
            this.canvas.drawRect(player.getPosition(), player.getWidth(), player.getHeight(), player.getColor());
            // Draw health bar
            const healthBarPos = new Vector2D(player.getPosition().x, player.getPosition().y - 8);
            this.canvas.drawRect(healthBarPos, (player.getWidth() * player.getCurrentHP()) / player.getMaxHP(), 4, "red");
            this.canvas.drawStroke(healthBarPos, (player.getWidth() * player.getCurrentHP()) / player.getMaxHP(), 5, "white");
        });
        // Draw bullets
        this.bullets.forEach((bullet) => {
            if (bullet.getCollideTime() <= 5) {
                bullet.update(deltaTime, this.canvas.getWidth(), this.canvas.getHeight());
                this.canvas.drawCircle(bullet.getPosition(), bullet.getRadius(), "white");
                // Check collision with players
                this.players.forEach((player) => {
                    if (bullet.checkCollision(player)) {
                        player.reduceHP(2);
                        this.bullets = this.bullets.filter((b) => b !== bullet);
                    }
                });
            }
            else {
                this.bullets = this.bullets.filter((b) => b !== bullet);
            }
        });
        // Draw enemies
        this.enemies.forEach((enemy) => {
            const pos = enemy.getPosition();
            if (pos) {
                enemy.update();
                this.canvas.drawRect(pos, 30, 30, "green");
            }
        });
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    startGame() {
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}
// Initialize game
document.addEventListener("DOMContentLoaded", () => {
    const game = new Game();
    const spawnPosition = new Vector2D(80, 80);
    const firstPlayer = new Player(spawnPosition);
    game.addPlayer(firstPlayer);
    game.startGame();
});
