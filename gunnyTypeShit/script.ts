class Vector2D {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

class Bullet {
  private position: Vector2D;
  private velocity: Vector2D;
  private gravity: number = 0.5;
  private wind: number;
  private isActive: boolean = false;

  constructor(startPos: Vector2D, angle: number, power: number, wind: number) {
    this.position = new Vector2D(startPos.x, startPos.y);
    const radian = (angle * Math.PI) / 180;
    this.velocity = new Vector2D(
      (Math.cos(radian) * power) / 10,
      (-Math.sin(radian) * power) / 10
    );
    this.wind = wind;
  }

  update() {
    if (!this.isActive) return;

    // Apply wind force
    this.velocity.x += this.wind * 0.01;

    // Apply gravity
    this.velocity.y += this.gravity;

    // Update position
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.isActive) return;

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  shoot() {
    this.isActive = true;
  }

  isOutOfBounds(width: number, height: number): boolean {
    return (
      this.position.x < 0 ||
      this.position.x > width ||
      this.position.y < 0 ||
      this.position.y > height
    );
  }

  getPosition() {
    return this.position;
  }

  isShot() {
    return this.isActive;
  }
}

class Enemy {
  private position: Vector2D;
  private width: number = 32;
  private height: number = 32;
  private health: number = 100;

  constructor(pos: Vector2D) {
    this.position = pos;
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Draw enemy
    ctx.fillStyle = "red";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

    // Draw health bar
    ctx.fillStyle = "black";
    ctx.fillRect(this.position.x, this.position.y - 20, this.width, 10);
    ctx.fillStyle = "green";
    ctx.fillRect(
      this.position.x,
      this.position.y - 20,
      (this.width * this.health) / 100,
      10
    );
  }

  takeDamage(damage: number) {
    this.health = Math.max(0, this.health - damage);
  }

  checkCollision(bulletPos: Vector2D): boolean {
    return (
      bulletPos.x > this.position.x &&
      bulletPos.x < this.position.x + this.width &&
      bulletPos.y > this.position.y &&
      bulletPos.y < this.position.y + this.height
    );
  }

  isDead(): boolean {
    return this.health <= 0;
  }
}

class Player {
  private position: Vector2D;
  private width: number;
  private height: number;
  private bullet: Bullet | null = null;

  constructor(spawnPos: Vector2D) {
    this.position = spawnPos;
    this.width = 32;
    this.height = 32;
  }

  shoot(angle: number, power: number, wind: number) {
    if (this.bullet && this.bullet.isShot()) return false;

    this.bullet = new Bullet(
      new Vector2D(this.position.x + this.width / 2, this.position.y),
      angle,
      power,
      wind
    );
    this.bullet.shoot();
    return true;
  }

  update() {
    this.bullet?.update();
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Draw player
    ctx.fillStyle = "blue";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

    // Draw bullet
    this.bullet?.draw(ctx);
  }

  getBulletPosition(): Vector2D | null {
    return this.bullet?.getPosition() || null;
  }

  isBulletActive(): boolean {
    return this.bullet?.isShot() || false;
  }

  checkBulletOutOfBounds(width: number, height: number): boolean {
    return this.bullet?.isOutOfBounds(width, height) || false;
  }

  resetBullet() {
    this.bullet = null;
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

  moveLeft() {
    this.position.x -= 10;
  }

  moveRight() {
    this.position.x += 10;
  }

  moveUp() {
    this.position.y -= 10;
  }

  moveDown() {
    this.position.y += 10;
  }
}

class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private canvas_width: number;
  private canvas_height: number;
  private power: number;
  private maxPower: number;
  private degree: number;
  private maxDegree: number;
  private powerDirection: number;
  private wind: number;

  private player: Player;
  private enemy: Enemy;

  constructor() {
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d");
    this.canvas_width = 1400;
    this.canvas_height = 700;
    this.canvas.width = this.canvas_width;
    this.canvas.height = this.canvas_height;
    this.degree = 0;
    this.power = 0;
    this.maxDegree = 180;
    this.maxPower = 500;
    this.powerDirection = 1;
    this.wind = 0;

    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp") {
        if (this.degree < this.maxDegree) {
          this.degree += 5;
        }
      } else if (e.key === "ArrowDown") {
        if (this.degree > 0) {
          this.degree -= 5;
        }
      } else if (e.key === " ") {
        e.preventDefault();
        if (this.power >= this.maxPower) {
          this.powerDirection = -1;
        } else if (this.power <= 0) {
          this.powerDirection = 1;
        }

        if (this.powerDirection === 1) this.power += 10;
        else if (this.powerDirection === -1) this.power -= 10;
      } else if (e.key === "w") {
        this.player.moveUp();
      } else if (e.key === "a") {
        this.player.moveLeft();
      } else if (e.key === "s") {
        this.player.moveDown();
      } else if (e.key === "d") {
        this.player.moveRight();
      }
    });

    const shootButton = document.getElementById("shootButton");
    shootButton?.addEventListener("click", () => {
      if (this.player.shoot(this.degree, this.power, this.wind)) {
        // Generate new random wind after successful shot
        this.wind = (Math.random() - 0.5) * 2; // Random value between -1 and 1
      }
    });

    this.player = new Player(new Vector2D(100, this.canvas_height - 200));
    this.enemy = new Enemy(
      new Vector2D(this.canvas_width - 200, this.canvas_height - 200)
    );

    this.gameLoop = this.gameLoop.bind(this);
    requestAnimationFrame(this.gameLoop);
  }

  drawBackGround() {
    if (this.ctx) {
      this.ctx.fillStyle = "#C9997D";
      this.ctx.fillRect(0, 0, this.canvas_width, this.canvas_height);
    }
  }

  drawWind() {
    if (this.ctx) {
      this.ctx.fillStyle = "white";
      this.ctx.font = "20px Arial";
      this.ctx.fillText(`${this.wind.toFixed(2)}`, 20, 30);

      // Draw wind direction arrow
      const arrowLength = Math.abs(this.wind) * 50;
      const arrowX = 100;
      const arrowY = 25;

      this.ctx.beginPath();
      this.ctx.strokeStyle = "white";
      if (this.wind > 0) {
        this.ctx.fillStyle = "green";
        this.ctx.fillText(">>>>>>>>>>>", arrowX, arrowY + 5);
      } else {
        this.ctx.fillStyle = "green";
        this.ctx.fillText("<<<<<<<<<<<", arrowX, arrowY + 5);
      }
      this.ctx.stroke();
    }
  }

  drawPower() {
    if (this.ctx) {
      this.powerDirection === 1
        ? (this.ctx.fillStyle = "green")
        : (this.ctx.fillStyle = "orange");
      this.ctx.fillRect(240, this.canvas_height - 40, this.power * 2, 20);

      this.ctx.strokeStyle = "white";
      this.ctx.strokeRect(240, this.canvas_height - 40, this.maxPower * 2, 20);
    }
  }

  drawDegree() {
    if (this.ctx) {
      const radius = 80;
      this.ctx.beginPath();
      this.ctx.strokeStyle = "white";
      this.ctx.arc(120, this.canvas_height - 20, radius, Math.PI, 2 * Math.PI);
      this.ctx.lineWidth = 5;
      this.ctx.stroke();

      this.ctx.fillStyle = "black";
      this.ctx.font = "20px arial";
      this.ctx.fillText("90", 110, this.canvas_height - 80);
      this.ctx.fillText("180", 44, this.canvas_height - 24);
      this.ctx.fillText("0", 184, this.canvas_height - 24);

      this.ctx.beginPath();
      this.ctx.strokeStyle = "red";
      const radian = (this.degree * Math.PI) / 180;
      const centerX = 120;
      const centerY = this.canvas_height - 22;
      const x = centerX + radius * Math.cos(radian);
      const y = centerY - radius * Math.sin(radian);
      this.ctx.moveTo(centerX, centerY);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
    }
  }

  checkCollisions() {
    if (!this.ctx) return;

    const bulletPos = this.player.getBulletPosition();
    if (bulletPos && this.enemy.checkCollision(bulletPos)) {
      this.enemy.takeDamage(20);
      this.player.resetBullet();

      if (this.enemy.isDead()) {
        alert("You won!");
        // Reset game or handle win condition
      }
    }
  }

  clearCanvas() {
    this.drawBackGround();
  }

  gameLoop() {
    this.clearCanvas();

    // Update
    this.player.update();

    if (
      this.player.checkBulletOutOfBounds(this.canvas_width, this.canvas_height)
    ) {
      this.player.resetBullet();
    }

    this.checkCollisions();

    // Draw
    this.drawWind();
    this.player.draw(this.ctx!);
    this.enemy.draw(this.ctx!);
    this.drawPower();
    this.drawDegree();

    requestAnimationFrame(this.gameLoop);
  }
}

new Game();
