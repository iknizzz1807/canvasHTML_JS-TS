class Vector2D {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

class Canvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;

  constructor() {
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    if (this.canvas) {
      this.ctx = this.canvas.getContext("2d");
    }

    if (!this.ctx) return;

    const CANVAS_WIDTH = 1400;
    const CANVAS_HEIGHT = 700;

    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;

    this.drawBackground();
  }

  getCanvas() {
    return this.canvas;
  }

  getCtx() {
    if (this.ctx) return this.ctx;
  }

  drawBackground() {
    if (this.ctx) {
      this.ctx.fillStyle = "#F8E3D3";
      this.ctx.fillRect(0, 0, 1400, 700);
    }
  }

  drawSquare(startPos: Vector2D, width: number, height: number, color: string) {
    if (this.ctx) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(startPos.x, startPos.y, width, height);
    }
  }

  drawLine(startPos: Vector2D, endPos: Vector2D, color: string) {
    if (this.ctx) {
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.moveTo(startPos.x, startPos.y);
      this.ctx.lineTo(endPos.x, endPos.y);
      this.ctx.stroke();
    }
  }

  drawImage(
    image: HTMLImageElement,
    pos: Vector2D,
    width: number,
    height: number
  ) {
    if (this.ctx) {
      this.ctx.drawImage(image, pos.x, pos.y, width, height);
    }
  }

  drawScore(score: number) {
    if (this.ctx) {
      this.ctx.fillStyle = "black";
      this.ctx.font = "40px serif";
      this.ctx.fillText("Score: " + score.toString(), 40, 40);
    }
  }

  showGameOver(score: number) {
    if (this.ctx) {
      this.ctx.fillStyle = "green";
      this.ctx.font = "40px serif";
      this.ctx.fillText(
        "Game over!",
        this.canvas.width / 2 - 80,
        this.canvas.height / 2 - 10
      );

      this.ctx.fillStyle = "blue";
      this.ctx.font = "32px serif";
      this.ctx.fillText(
        "Score: " + score.toString(),
        this.canvas.width / 2 - 40,
        this.canvas.height / 2 + 30
      );

      this.ctx.fillStyle = "orange";
      this.ctx.font = "40px serif";
      this.ctx.fillText(
        "Space to restart",
        this.canvas.width / 2 - 90,
        this.canvas.height / 2 + 80
      );
    }
  }

  clearCanvas() {
    if (this.ctx) {
      this.drawBackground();
    }
  }
}

class Player {
  private state: "up" | "down";
  private position: Vector2D;
  private frames: HTMLImageElement[];
  private currentFrame: HTMLImageElement | null;
  private frameIndex: number;
  private frameInterval: number;
  private frameTimer: number;
  private moveTimer: number;
  private moveInterval: number;
  private slowStartTimer: number;

  constructor(spawnPos: Vector2D) {
    this.state = "down";
    this.position = spawnPos;
    this.frames = [];
    this.currentFrame = null;
    this.frameIndex = 0;
    this.frameInterval = 200; // 0.2 seconds per frame => 5fps for idle animation
    this.frameTimer = 0;
    this.moveTimer = 0;
    this.moveInterval = 1 / 60;
    this.slowStartTimer = 0;

    this.loadAssets();
  }

  loadAssets() {
    for (let i = 0; i < 3; i++) {
      const img = new Image();
      img.src = `assets/shark_00${i}.png`;
      this.frames.push(img);
    }
    const img = new Image();
    img.src = `assets/shark_001.png`;
    this.frames.push(img);
  }

  update(deltaTime: number) {
    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.frameInterval) {
      this.frameTimer = 0;
      this.frameIndex += 1;
      if (this.frameIndex >= this.frames.length) this.frameIndex = 0;
    }

    this.moveTimer += deltaTime;
    this.slowStartTimer += deltaTime;
    if (this.moveTimer >= this.moveInterval) {
      if (this.slowStartTimer <= 2000) {
        this.position.x += 1;
        this.state === "up" ? (this.position.y -= 2) : (this.position.y += 2);
      } else {
        if (this.position.x <= 700) this.position.x += 2;
        this.state === "up" ? (this.position.y -= 4) : (this.position.y += 4);
      }
    }
  }

  toggleState() {
    this.state === "up" ? (this.state = "down") : (this.state = "up");
  }

  getPosition() {
    return this.position;
  }

  getState() {
    return this.state;
  }

  getCurrentFrame() {
    this.currentFrame = this.frames[this.frameIndex];
    return this.currentFrame;
  }

  getBounds() {
    return {
      x: this.position.x + 20,
      y: this.position.y + 20,
      width: 30,
      height: 45,
    };
  }
}

class Trail {
  private points: Vector2D[];
  private color: string;
  private reachMiddle: boolean;

  constructor(color: string) {
    this.points = [];
    this.color = color;
    this.reachMiddle = false;
  }

  addPoint(point: Vector2D) {
    this.points.push(new Vector2D(point.x, point.y));
    if (this.reachMiddle) {
      for (let i = 0; i < this.points.length; i++) {
        this.points[i].x -= 2;
      }
      this.points.shift();
    }
    if (point.x >= 700) {
      this.reachMiddle = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.points.length < 2) return;

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);

    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x, this.points[i].y);
    }

    ctx.stroke();
  }
}

class Obstacle {
  private position: Vector2D;
  private size: number;
  private color: string;
  private isTop: boolean;

  constructor(position: Vector2D, size: number, color: string, isTop: boolean) {
    this.position = position;
    this.size = size;
    this.color = color;
    this.isTop = isTop;
  }

  // Helper function to determine if a point is inside the triangle
  private pointInTriangle(point: Vector2D): boolean {
    let p1: Vector2D, p2: Vector2D, p3: Vector2D;

    if (this.isTop) {
      p1 = new Vector2D(this.position.x, this.position.y); // Top-left
      p2 = new Vector2D(this.position.x + this.size, this.position.y); // Top-right
      p3 = new Vector2D(
        this.position.x + this.size / 2,
        this.position.y + this.size
      ); // Bottom-middle
    } else {
      p1 = new Vector2D(this.position.x, this.position.y); // Bottom-left
      p2 = new Vector2D(this.position.x + this.size, this.position.y); // Bottom-right
      p3 = new Vector2D(
        this.position.x + this.size / 2,
        this.position.y - this.size
      ); // Top-middle
    }

    const areaOrig = Math.abs(
      (p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y)
    );
    const area1 = Math.abs(
      (p1.x - point.x) * (p2.y - point.y) - (p2.x - point.x) * (p1.y - point.y)
    );
    const area2 = Math.abs(
      (p2.x - point.x) * (p3.y - point.y) - (p3.x - point.x) * (p2.y - point.y)
    );
    const area3 = Math.abs(
      (p3.x - point.x) * (p1.y - point.y) - (p1.x - point.x) * (p3.y - point.y)
    );

    return Math.abs(area1 + area2 + area3 - areaOrig) < 0.01;
  }

  private lineIntersects(
    l1p1: Vector2D,
    l1p2: Vector2D,
    l2p1: Vector2D,
    l2p2: Vector2D
  ): boolean {
    const denominator =
      (l2p2.y - l2p1.y) * (l1p2.x - l1p1.x) -
      (l2p2.x - l2p1.x) * (l1p2.y - l1p1.y);

    if (denominator === 0) return false;

    const ua =
      ((l2p2.x - l2p1.x) * (l1p1.y - l2p1.y) -
        (l2p2.y - l2p1.y) * (l1p1.x - l2p1.x)) /
      denominator;
    const ub =
      ((l1p2.x - l1p1.x) * (l1p1.y - l2p1.y) -
        (l1p2.y - l1p1.y) * (l1p1.x - l2p1.x)) /
      denominator;

    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
  }

  checkCollision(playerBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): boolean {
    // Get triangle vertices
    let p1: Vector2D, p2: Vector2D, p3: Vector2D;
    if (this.isTop) {
      p1 = new Vector2D(this.position.x, this.position.y);
      p2 = new Vector2D(this.position.x + this.size, this.position.y);
      p3 = new Vector2D(
        this.position.x + this.size / 2,
        this.position.y + this.size
      );
    } else {
      p1 = new Vector2D(this.position.x, this.position.y);
      p2 = new Vector2D(this.position.x + this.size, this.position.y);
      p3 = new Vector2D(
        this.position.x + this.size / 2,
        this.position.y - this.size
      );
    }

    // Get player corners
    const playerCorners = [
      new Vector2D(playerBounds.x, playerBounds.y),
      new Vector2D(playerBounds.x + playerBounds.width, playerBounds.y),
      new Vector2D(
        playerBounds.x + playerBounds.width,
        playerBounds.y + playerBounds.height
      ),
      new Vector2D(playerBounds.x, playerBounds.y + playerBounds.height),
    ];

    // Check if any player corner is inside the triangle
    for (const corner of playerCorners) {
      if (this.pointInTriangle(corner)) {
        return true;
      }
    }

    // Check if any triangle edge intersects with any player edge
    const triangleEdges = [
      [p1, p2],
      [p2, p3],
      [p3, p1],
    ];

    const playerEdges = [
      [playerCorners[0], playerCorners[1]],
      [playerCorners[1], playerCorners[2]],
      [playerCorners[2], playerCorners[3]],
      [playerCorners[3], playerCorners[0]],
    ];

    for (const [t1, t2] of triangleEdges) {
      for (const [p1, p2] of playerEdges) {
        if (this.lineIntersects(t1, t2, p1, p2)) {
          return true;
        }
      }
    }

    return false;
  }

  update(deltaTime: number) {
    this.position.x -= 4; // Move the obstacle to the left
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    if (this.isTop) {
      ctx.moveTo(this.position.x, this.position.y);
      ctx.lineTo(this.position.x + this.size, this.position.y);
      ctx.lineTo(this.position.x + this.size / 2, this.position.y + this.size);
    } else {
      ctx.moveTo(this.position.x, this.position.y);
      ctx.lineTo(this.position.x + this.size, this.position.y);
      ctx.lineTo(this.position.x + this.size / 2, this.position.y - this.size);
    }
    ctx.closePath();
    ctx.fill();
  }

  isOffScreen(): boolean {
    return this.position.x + this.size < 0;
  }

  getBounds() {
    return {
      x: this.position.x,
      y: this.isTop ? this.position.y : this.position.y - this.size,
      width: this.size,
      height: this.size,
    };
  }
}

class Game {
  private canvas: Canvas;
  private player: Player;
  private lastTime: number;
  private trail: Trail;
  private obstacles: Obstacle[];
  private gameOver: boolean;
  private score: number;
  private spawnObstableTimeoutID: number;

  constructor() {
    this.canvas = new Canvas();
    this.player = new Player(
      new Vector2D(0, this.canvas.getCanvas().height / 2)
    );
    this.trail = new Trail("lightblue");
    this.lastTime = 0;
    this.obstacles = [];
    this.gameOver = false;
    this.score = 0;
    this.spawnObstableTimeoutID = 0;

    this.canvas.getCanvas().addEventListener("mousedown", () => {
      this.player.toggleState();
    });

    window.addEventListener("keydown", (e: KeyboardEvent) => {
      if (this.gameOver && e.key === " ") {
        this.restartGame();
      }
    });

    this.spawnObstacle();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private spawnObstacle() {
    const canvasHeight = this.canvas.getCanvas().height;
    const canvasWidth = this.canvas.getCanvas().width;
    const minSize = 200;
    const maxSize = canvasHeight / 2 - 80;
    const size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
    const color = "red";
    const isTop = Math.random() < 0.5;
    const position = new Vector2D(canvasWidth, isTop ? 0 : canvasHeight);
    const obstacle = new Obstacle(position, size, color, isTop);
    this.obstacles.push(obstacle);

    const minDelay = 400;
    const maxDelay = 800;
    const delay =
      Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

    this.spawnObstableTimeoutID = setTimeout(() => this.spawnObstacle(), delay);
  }

  private gameLoop(timestamp: number) {
    if (this.gameOver) {
      this.canvas.showGameOver(this.score);
      this.score = 0;
      window.clearTimeout(this.spawnObstableTimeoutID);
      return;
    }

    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.canvas.clearCanvas();
    // Add current player position to trail
    this.trail.addPoint(
      new Vector2D(
        this.player.getPosition().x,
        this.player.getPosition().y + 40
      )
    );
    // Draw the trail
    const ctx = this.canvas.getCtx();
    if (ctx) {
      this.trail.draw(ctx);
    }
    // Draw the player
    this.canvas.drawImage(
      this.player.getCurrentFrame(),
      this.player.getPosition(),
      80,
      80
    );

    // Update and draw the obstacles
    this.obstacles = this.obstacles.filter((obstacle) => {
      obstacle.update(deltaTime);
      if (ctx) {
        obstacle.draw(ctx);
      }

      if (
        obstacle.getBounds().x + obstacle.getBounds().width <
        this.player.getPosition().x
      ) {
        this.score++;
      }

      return !obstacle.isOffScreen();
    });

    // Check for collisions
    const playerBounds = this.player.getBounds();
    for (const obstacle of this.obstacles) {
      if (obstacle.checkCollision(playerBounds)) {
        this.gameOver = true;
      }
    }

    // Draw score
    this.canvas.drawScore(this.score);

    if (
      this.player.getPosition().y <= 0 ||
      this.player.getPosition().y + 60 >= this.canvas.getCanvas().height
    )
      this.gameOver = true;

    this.player.update(deltaTime);

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private restartGame() {
    this.obstacles = [];
    this.canvas.clearCanvas();
    this.player = new Player(
      new Vector2D(0, this.canvas.getCanvas().height / 2)
    );
    this.trail = new Trail("lightblue");
    this.gameOver = false;
    this.lastTime = performance.now();
    this.score = 0;
    this.spawnObstacle();
    requestAnimationFrame(this.gameLoop.bind(this));
  }
}

new Game();
