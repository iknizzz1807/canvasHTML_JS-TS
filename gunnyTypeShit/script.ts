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
}

class Player {
  private position: Vector2D;
  private canShoot: boolean;
  private width: number;
  private height: number;

  constructor(spawnPos: Vector2D) {
    this.position = spawnPos;
    this.width = 32;
    this.height = 32;
    this.canShoot = true;
  }

  shoot() {
    if (this.canShoot) {
      this.canShoot = false;
      // shoot
    }
  }

  move(direction: "left" | "right") {
    if (direction === "left") {
      this.position.x -= 2;
    } else if (direction === "right") {
      this.position.x += 2;
    }
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

  private player: Player;

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
    this.maxPower = 100;

    window.addEventListener("keydown", (e) => {
      if (e.key === " ") {
        if (this.power < this.maxPower) this.power += 2;
      }
    });

    this.drawBackGround();

    this.player = new Player(new Vector2D(100, this.canvas_height - 200));

    this.gameLoop = this.gameLoop.bind(this);
    requestAnimationFrame(this.gameLoop);
  }

  drawBackGround() {
    if (this.ctx) {
      this.ctx.fillStyle = "#C9997D";
      this.ctx.fillRect(0, 0, this.canvas_width, this.canvas_height);
    }
  }

  drawPlayer() {
    if (this.ctx) {
      const pos = this.player.getPosition();
      const width = this.player.getWidth();
      const height = this.player.getHeight();
      this.ctx.fillStyle = "blue";
      this.ctx.fillRect(pos.x, pos.y, width, height);
    }
  }

  drawPower() {
    if (this.ctx) {
      this.ctx.fillStyle = "green";
      this.ctx.fillRect(240, this.canvas_height - 40, this.power * 10, 20);

      this.ctx.strokeStyle = "white";
      this.ctx.strokeRect(240, this.canvas_height - 40, this.maxPower * 10, 20);
    }
  }

  drawDegree() {
    if (this.ctx) {
      this.ctx.beginPath();
      this.ctx.arc(120, this.canvas_height - 20, 80, Math.PI, 2 * Math.PI);
      this.ctx.fillStyle = "transparent";
      this.ctx.fill();
      this.ctx.lineWidth = 5;
      this.ctx.stroke();
    }
  }

  clearCanvas() {
    this.drawBackGround();
  }

  gameLoop() {
    this.clearCanvas();

    this.drawPlayer();

    this.drawPower();

    this.drawDegree();

    requestAnimationFrame(this.gameLoop);
  }
}

new Game();
