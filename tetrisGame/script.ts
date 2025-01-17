class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private previewCanvas: HTMLCanvasElement;
  private previewCtx: CanvasRenderingContext2D;
  private canvas_width: number;
  private canvas_height: number;
  private preview_size: number;
  private totalSquaresHeight: number;
  private totalSquaresWidth: number;
  private squareSize: number;
  private gameBoard: number[][];
  private currentPiece: {
    shape: number[][];
    x: number;
    y: number;
    color: string;
    type: string;
  } | null;
  private nextPiece: {
    shape: number[][];
    color: string;
    type: string;
  } | null;
  private ghostPiece: {
    x: number;
    y: number;
  } | null;
  private score: number;
  private gameOver: boolean;
  private lastTime: number;
  private dropTime: number;
  private colors: { [key: string]: string };

  private readonly SHAPES = {
    I: {
      shape: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      startX: 3,
    },
    O: {
      shape: [
        [1, 1],
        [1, 1],
      ],
      startX: 4,
    },
    T: {
      shape: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      startX: 3,
    },
    L: {
      shape: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
      ],
      startX: 3,
    },
    J: {
      shape: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      startX: 3,
    },
    S: {
      shape: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
      ],
      startX: 3,
    },
    Z: {
      shape: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
      ],
      startX: 3,
    },
  };

  private readonly WALL_KICK_DATA = {
    JLSTZ: [
      [
        [0, 0],
        [-1, 0],
        [-1, 1],
        [0, -2],
        [-1, -2],
      ],
      [
        [0, 0],
        [1, 0],
        [1, -1],
        [0, 2],
        [1, 2],
      ],
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, -2],
        [1, -2],
      ],
      [
        [0, 0],
        [-1, 0],
        [-1, -1],
        [0, 2],
        [-1, 2],
      ],
    ],
    I: [
      [
        [0, 0],
        [-2, 0],
        [1, 0],
        [-2, -1],
        [1, 2],
      ],
      [
        [0, 0],
        [-1, 0],
        [2, 0],
        [-1, 2],
        [2, -1],
      ],
      [
        [0, 0],
        [2, 0],
        [-1, 0],
        [2, 1],
        [-1, -2],
      ],
      [
        [0, 0],
        [1, 0],
        [-2, 0],
        [1, -2],
        [-2, 1],
      ],
    ],
  };

  constructor() {
    this.canvas_width = 300;
    this.canvas_height = 600;
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.canvas.width = this.canvas_width;
    this.canvas.height = this.canvas_height;

    this.preview_size = 120;
    this.previewCanvas = document.getElementById(
      "preview"
    ) as HTMLCanvasElement;
    this.previewCtx = this.previewCanvas.getContext(
      "2d"
    ) as CanvasRenderingContext2D;
    this.previewCanvas.width = this.preview_size;
    this.previewCanvas.height = this.preview_size;

    this.squareSize = 30;
    this.totalSquaresHeight = 20;
    this.totalSquaresWidth = 10;
    this.score = 0;
    this.gameOver = false;
    this.lastTime = 0;
    this.dropTime = 1000; // Initial drop speed
    this.ghostPiece = null;

    this.colors = {
      I: "#00f0f0",
      O: "#f0f000",
      T: "#a000f0",
      L: "#f0a000",
      J: "#0000f0",
      S: "#00f000",
      Z: "#f00000",
    };

    this.initializeBoard();
    this.currentPiece = null;
    this.nextPiece = null;

    document.addEventListener("keydown", this.handleKeyPress.bind(this));

    this.startGame();
  }

  private initializeBoard(): void {
    this.gameBoard = [];
    for (let i = 0; i < this.totalSquaresHeight; i++) {
      const row: number[] = [];
      for (let j = 0; j < this.totalSquaresWidth; j++) {
        row.push(0);
      }
      this.gameBoard.push(row);
    }
  }

  private createNewPiece(): void {
    const shapes = Object.keys(this.SHAPES);
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];

    if (!this.nextPiece) {
      this.nextPiece = {
        shape: this.SHAPES[randomShape as keyof typeof this.SHAPES].shape,
        color: this.colors[randomShape],
        type: randomShape,
      };
    }

    const shapeData =
      this.SHAPES[this.nextPiece.type as keyof typeof this.SHAPES];
    this.currentPiece = {
      shape: this.nextPiece.shape,
      x: shapeData.startX,
      y: 0,
      color: this.nextPiece.color,
      type: this.nextPiece.type,
    };

    const nextRandomShape = shapes[Math.floor(Math.random() * shapes.length)];
    this.nextPiece = {
      shape: this.SHAPES[nextRandomShape as keyof typeof this.SHAPES].shape,
      color: this.colors[nextRandomShape],
      type: nextRandomShape,
    };

    this.updateGhostPiece();

    if (this.checkCollision()) {
      this.gameOver = true;
    }
  }

  private checkCollision(
    shape = this.currentPiece?.shape,
    x = this.currentPiece?.x,
    y = this.currentPiece?.y
  ): boolean {
    if (!shape || x === undefined || y === undefined) return false;

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const boardX = x + col;
          const boardY = y + row;

          if (
            boardX < 0 ||
            boardX >= this.totalSquaresWidth ||
            boardY >= this.totalSquaresHeight ||
            (boardY >= 0 && this.gameBoard[boardY][boardX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private rotatePiece(direction: 1 | -1): void {
    if (!this.currentPiece) return;

    const oldShape = this.currentPiece.shape.map((row) => [...row]);
    let newShape;

    if (direction === 1) {
      // Clockwise
      newShape = this.currentPiece.shape[0].map((_, i) =>
        this.currentPiece!.shape.map((row) => row[i]).reverse()
      );
    } else {
      // Counter-clockwise
      newShape = this.currentPiece.shape[0].map((_, i) =>
        this.currentPiece!.shape.map((row) => row[row.length - 1 - i])
      );
    }

    const kicks =
      this.currentPiece.type === "I"
        ? this.WALL_KICK_DATA.I
        : this.WALL_KICK_DATA.JLSTZ;

    let kicked = false;
    this.currentPiece.shape = newShape;

    for (const [dx, dy] of kicks[0]) {
      const newX = this.currentPiece.x + dx;
      const newY = this.currentPiece.y - dy;

      if (!this.checkCollision(newShape, newX, newY)) {
        this.currentPiece.x = newX;
        this.currentPiece.y = newY;
        kicked = true;
        break;
      }
    }

    if (!kicked) {
      this.currentPiece.shape = oldShape;
    }

    this.updateGhostPiece();
  }

  private updateGhostPiece(): void {
    if (!this.currentPiece) return;

    this.ghostPiece = {
      x: this.currentPiece.x,
      y: this.currentPiece.y,
    };

    while (
      !this.checkCollision(
        this.currentPiece.shape,
        this.ghostPiece.x,
        this.ghostPiece.y + 1
      )
    ) {
      this.ghostPiece.y++;
    }
  }

  private hardDrop(): void {
    if (!this.currentPiece || !this.ghostPiece) return;

    this.currentPiece.y = this.ghostPiece.y;
    this.mergePiece();
    this.clearLines();
    this.createNewPiece();
  }

  private handleKeyPress(event: KeyboardEvent): void {
    if (this.gameOver) {
      if (event.key === "r" || event.key === "R") {
        this.startGame();
      }
      return;
    }

    switch (event.key) {
      case "ArrowLeft":
        if (this.currentPiece) {
          this.currentPiece.x--;
          if (this.checkCollision()) {
            this.currentPiece.x++;
          } else {
            this.updateGhostPiece();
          }
        }
        break;
      case "ArrowRight":
        if (this.currentPiece) {
          this.currentPiece.x++;
          if (this.checkCollision()) {
            this.currentPiece.x--;
          } else {
            this.updateGhostPiece();
          }
        }
        break;
      case "ArrowDown":
        this.moveDown();
        break;
      case " ": // Space bar
        this.hardDrop();
        break;
      case "ArrowUp":
        this.rotatePiece(1); // Clockwise
        break;
      case "z":
      case "Z":
        this.rotatePiece(-1); // Counter-clockwise
        break;
    }
    this.draw();
  }

  private moveDown(): void {
    if (!this.currentPiece) return;

    this.currentPiece.y++;
    if (this.checkCollision()) {
      this.currentPiece.y--;
      this.mergePiece();
      this.clearLines();
      this.createNewPiece();
    }
  }

  private mergePiece(): void {
    if (!this.currentPiece) return;

    for (let y = 0; y < this.currentPiece.shape.length; y++) {
      for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
        if (this.currentPiece.shape[y][x]) {
          const boardY = this.currentPiece.y + y;
          if (boardY >= 0) {
            this.gameBoard[boardY][this.currentPiece.x + x] = 1;
          }
        }
      }
    }
  }

  private clearLines(): void {
    let linesCleared = 0;

    for (let y = this.totalSquaresHeight - 1; y >= 0; y--) {
      if (this.gameBoard[y].every((cell) => cell === 1)) {
        this.gameBoard.splice(y, 1);

        const newRow: number[] = [];
        for (let i = 0; i < this.totalSquaresWidth; i++) {
          newRow.push(0);
        }

        this.gameBoard.unshift(newRow);
        linesCleared++;
        y++;
      }
    }

    if (linesCleared > 0) {
      this.score += [0, 100, 300, 500, 800][linesCleared];
      this.dropTime = Math.max(100, 1000 - Math.floor(this.score / 1000) * 50);
    }
  }

  private drawBoard(): void {
    // Draw background
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.canvas_width, this.canvas_height);

    // Draw grid
    this.ctx.strokeStyle = "#333333";
    for (let i = 0; i <= this.totalSquaresWidth; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.squareSize, 0);
      this.ctx.lineTo(i * this.squareSize, this.canvas_height);
      this.ctx.stroke();
    }
    for (let i = 0; i <= this.totalSquaresHeight; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.squareSize);
      this.ctx.lineTo(this.canvas_width, i * this.squareSize);
      this.ctx.stroke();
    }

    // Draw placed pieces
    for (let y = 0; y < this.totalSquaresHeight; y++) {
      for (let x = 0; x < this.totalSquaresWidth; x++) {
        if (this.gameBoard[y][x]) {
          this.ctx.fillStyle = "#808080";
          this.ctx.fillRect(
            x * this.squareSize,
            y * this.squareSize,
            this.squareSize - 1,
            this.squareSize - 1
          );
        }
      }
    }
  }
  private drawGhostPiece(): void {
    if (!this.currentPiece || !this.ghostPiece) return;

    this.ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    for (let y = 0; y < this.currentPiece.shape.length; y++) {
      for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
        if (this.currentPiece.shape[y][x]) {
          this.ctx.fillRect(
            (this.ghostPiece.x + x) * this.squareSize,
            (this.ghostPiece.y + y) * this.squareSize,
            this.squareSize - 1,
            this.squareSize - 1
          );
        }
      }
    }
  }

  private drawCurrentPiece(): void {
    if (!this.currentPiece) return;

    this.ctx.fillStyle = this.currentPiece.color;
    for (let y = 0; y < this.currentPiece.shape.length; y++) {
      for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
        if (this.currentPiece.shape[y][x]) {
          const boardX = this.currentPiece.x + x;
          const boardY = this.currentPiece.y + y;
          if (boardY >= 0) {
            this.ctx.fillRect(
              boardX * this.squareSize,
              boardY * this.squareSize,
              this.squareSize - 1,
              this.squareSize - 1
            );
          }
        }
      }
    }
  }

  private drawNextPiece(): void {
    if (!this.nextPiece) return;

    this.previewCtx.fillStyle = "#000000";
    this.previewCtx.fillRect(0, 0, this.preview_size, this.preview_size);

    const pieceWidth = this.nextPiece.shape[0].length;
    const pieceHeight = this.nextPiece.shape.length;
    const scale = Math.min(
      (this.preview_size * 0.8) / (pieceWidth * this.squareSize),
      (this.preview_size * 0.8) / (pieceHeight * this.squareSize)
    );
    const offsetX =
      (this.preview_size - pieceWidth * this.squareSize * scale) / 2;
    const offsetY =
      (this.preview_size - pieceHeight * this.squareSize * scale) / 2;

    this.previewCtx.fillStyle = this.nextPiece.color;
    for (let y = 0; y < pieceHeight; y++) {
      for (let x = 0; x < pieceWidth; x++) {
        if (this.nextPiece.shape[y][x]) {
          this.previewCtx.fillRect(
            offsetX + x * this.squareSize * scale,
            offsetY + y * this.squareSize * scale,
            this.squareSize * scale - 1,
            this.squareSize * scale - 1
          );
        }
      }
    }

    this.previewCtx.strokeStyle = "#333333";
    for (let x = 0; x <= pieceWidth; x++) {
      this.previewCtx.beginPath();
      this.previewCtx.moveTo(offsetX + x * this.squareSize * scale, offsetY);
      this.previewCtx.lineTo(
        offsetX + x * this.squareSize * scale,
        offsetY + pieceHeight * this.squareSize * scale
      );
      this.previewCtx.stroke();
    }
    for (let y = 0; y <= pieceHeight; y++) {
      this.previewCtx.beginPath();
      this.previewCtx.moveTo(offsetX, offsetY + y * this.squareSize * scale);
      this.previewCtx.lineTo(
        offsetX + pieceWidth * this.squareSize * scale,
        offsetY + y * this.squareSize * scale
      );
      this.previewCtx.stroke();
    }
  }

  private drawScore(): void {
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "20px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    this.ctx.fillText(`Level: ${Math.floor(this.score / 1000) + 1}`, 10, 60);
  }

  private drawGameOver(): void {
    if (!this.gameOver) return;

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    this.ctx.fillRect(0, 0, this.canvas_width, this.canvas_height);

    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "40px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "Game Over!",
      this.canvas_width / 2,
      this.canvas_height / 2 - 40
    );
    this.ctx.font = "20px Arial";
    this.ctx.fillText(
      `Final Score: ${this.score}`,
      this.canvas_width / 2,
      this.canvas_height / 2
    );
    this.ctx.fillText(
      "Press 'R' to restart",
      this.canvas_width / 2,
      this.canvas_height / 2 + 40
    );
  }

  private draw(): void {
    this.drawBoard();
    this.drawGhostPiece();
    this.drawCurrentPiece();
    this.drawNextPiece();
    this.drawScore();
    this.drawGameOver();
  }

  private update(currentTime: number): void {
    if (this.gameOver) {
      this.drawGameOver();
      return;
    }

    const deltaTime = currentTime - this.lastTime;

    if (deltaTime > this.dropTime) {
      this.moveDown();
      this.lastTime = currentTime;
    }

    this.draw();
    requestAnimationFrame(this.update.bind(this));
  }

  public startGame(): void {
    this.initializeBoard();
    this.score = 0;
    this.gameOver = false;
    this.dropTime = 1000;
    this.createNewPiece();
    this.lastTime = 0;
    requestAnimationFrame(this.update.bind(this));
  }
}

new Game();
