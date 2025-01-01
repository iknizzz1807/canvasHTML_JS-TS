interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface Keys {
  w: boolean;
  s: boolean;
  a: boolean;
  d: boolean;
}

class Car {
  public size: Size = { width: 40, height: 80 };
  public position: Position;
  public speed: number = 5;
  public minSpeed: number = 3;
  public maxSpeed: number = 8;
  public acceleration: number = 0.1;
  private color: string;

  constructor(initialPosition: Position, color: string = "blue") {
    this.position = initialPosition;
    this.color = color;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Car body
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.position.x,
      this.position.y,
      this.size.width,
      this.size.height
    );

    const wheelWidth = 8;
    const wheelHeight = 15;
    ctx.fillStyle = "black";

    ctx.fillRect(
      this.position.x - wheelWidth / 2,
      this.position.y + 10,
      wheelWidth,
      wheelHeight
    );
    ctx.fillRect(
      this.position.x + this.size.width - wheelWidth / 2,
      this.position.y + 10,
      wheelWidth,
      wheelHeight
    );

    ctx.fillRect(
      this.position.x - wheelWidth / 2,
      this.position.y + this.size.height - wheelHeight - 10,
      wheelWidth,
      wheelHeight
    );
    ctx.fillRect(
      this.position.x + this.size.width - wheelWidth / 2,
      this.position.y + this.size.height - wheelHeight - 10,
      wheelWidth,
      wheelHeight
    );
  }

  move(keys: Keys, canvasWidth: number): void {
    if (keys.w) {
      this.speed = Math.min(this.maxSpeed, this.speed + this.acceleration);
    }
    if (keys.s) {
      this.speed = Math.max(this.minSpeed, this.speed - this.acceleration);
    }

    if (keys.a) {
      this.position.x = Math.max(0, this.position.x - 5);
    }
    if (keys.d) {
      this.position.x = Math.min(
        canvasWidth - this.size.width,
        this.position.x + 5
      );
    }
  }

  checkCollision(otherCar: Car): boolean {
    return !(
      this.position.x > otherCar.position.x + otherCar.size.width ||
      this.position.x + this.size.width < otherCar.position.x ||
      this.position.y > otherCar.position.y + otherCar.size.height ||
      this.position.y + this.size.height < otherCar.position.y
    );
  }
}

class RoadLine {
  public position: Position;
  public size: Size = { width: 4, height: 30 };
  public speed: number = 0;

  constructor(position: Position) {
    this.position = position;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "white";
    ctx.fillRect(
      this.position.x,
      this.position.y,
      this.size.width,
      this.size.height
    );
  }

  move(playerSpeed: number): void {
    this.position.y += playerSpeed;
  }

  isOffScreen(canvasHeight: number): boolean {
    return this.position.y > canvasHeight;
  }
}

class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private playerCar: Car;
  private trafficCars: Car[] = [];
  private roadLines: RoadLine[] = [];
  private keys: Keys = { w: false, s: false, a: false, d: false };
  private lastCarSpawnTime: number = 0;
  private lastLineSpawnTime: number = 0;
  private carSpawnInterval: number = 2000;
  private lineSpawnInterval: number = 100;
  private score: number = 0;
  private gameOver: boolean = false;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d")!;

    this.canvas.width = 400;
    this.canvas.height = 600;

    this.playerCar = new Car({
      x: this.canvas.width / 2 - 20,
      y: this.canvas.height - 100,
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    document.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase() as keyof Keys;
      if (key in this.keys) {
        this.keys[key] = true;
      }
    });

    document.addEventListener("keyup", (e) => {
      const key = e.key.toLowerCase() as keyof Keys;
      if (key in this.keys) {
        this.keys[key] = false;
      }
    });
  }

  private spawnTrafficCar(): void {
    const currentTime = Date.now();
    if (currentTime - this.lastCarSpawnTime > this.carSpawnInterval) {
      // Random lane selection (left or right side of the road)
      const lane =
        Math.random() < 0.5
          ? this.canvas.width / 4
          : (this.canvas.width * 3) / 4;

      const position: Position = {
        x: lane - 20,
        y: -100,
      };

      this.trafficCars.push(new Car(position, "red"));
      this.lastCarSpawnTime = currentTime;
    }
  }

  private spawnRoadLine(): void {
    const currentTime = Date.now();
    if (currentTime - this.lastLineSpawnTime > this.lineSpawnInterval) {
      const position: Position = {
        x: this.canvas.width / 2 - 2,
        y: -30,
      };

      this.roadLines.push(new RoadLine(position));
      this.lastLineSpawnTime = currentTime;
    }
  }

  private drawRoad(): void {
    // Nền đường
    this.ctx.fillStyle = "#333333";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Lề đường
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(20, 0, 5, this.canvas.height);
    this.ctx.fillRect(this.canvas.width - 25, 0, 5, this.canvas.height);
  }

  private drawSpeed(): void {
    this.ctx.fillStyle = "white";
    this.ctx.font = "16px Arial";
    this.ctx.fillText(`Speed: ${this.playerCar.speed.toFixed(1)}`, 10, 50);
  }

  private drawScore(): void {
    this.ctx.fillStyle = "white";
    this.ctx.font = "20px Arial";
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);
  }

  public update(): void {
    if (this.gameOver) {
      return;
    }

    this.playerCar.move(this.keys, this.canvas.width);

    this.spawnTrafficCar();
    this.spawnRoadLine();

    this.trafficCars = this.trafficCars.filter((car) => {
      car.position.y += this.playerCar.speed;

      if (this.playerCar.checkCollision(car)) {
        this.gameOver = true;
      }

      if (car.position.y > this.canvas.height) {
        this.score++;
        return false;
      }
      return true;
    });

    this.roadLines = this.roadLines.filter((line) => {
      line.move(this.playerCar.speed);
      return !line.isOffScreen(this.canvas.height);
    });
  }

  public draw(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawRoad();

    this.roadLines.forEach((line) => line.draw(this.ctx));

    this.trafficCars.forEach((car) => car.draw(this.ctx));

    this.playerCar.draw(this.ctx);

    this.drawScore();
    this.drawSpeed();

    if (this.gameOver) {
      this.ctx.fillStyle = "white";
      this.ctx.font = "40px Arial";
      this.ctx.fillText(
        "Game Over!",
        this.canvas.width / 2 - 100,
        this.canvas.height / 2
      );
      this.ctx.font = "20px Arial";
      this.ctx.fillText(
        "Final Score: " + this.score,
        this.canvas.width / 2 - 50,
        this.canvas.height / 2 + 40
      );
    }
  }

  public gameLoop(): void {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }

  public start(): void {
    this.gameLoop();
  }
}

const game = new Game("canvas");
game.start();
