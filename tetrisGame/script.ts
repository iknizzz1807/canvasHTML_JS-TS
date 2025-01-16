const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

if (ctx) {
  //
}

class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private canvas_width: number;
  private canvas_height: number;
  private totalSquares: number;
  private totalSquaresHeight: number;
  private totalSquaresWidth: number;
  private squareSize: number;
  // each square is 30x30, so the game is 10x20 squares

  constructor() {
    this.canvas_width = 300;
    this.canvas_height = 600;
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.canvas.width = this.canvas_width;
    this.canvas.height = this.canvas_height;

    this.totalSquares = 200;
    this.squareSize = 30;
    this.totalSquaresHeight = 20;
    this.totalSquaresWidth = 10;

    this.clearCanvas();
    this.drawGrid();
  }

  clearCanvas() {
    this.ctx.fillStyle = "aqua";
    this.ctx.fillRect(0, 0, this.canvas_width, this.canvas_height);
  }

  drawGrid() {
    // Vertical
    this.ctx.strokeStyle = "white";
    for (let i = 1; i <= this.totalSquaresWidth; i++) {
      this.ctx.moveTo(i * this.squareSize, 0);
      this.ctx.lineTo(i * this.squareSize, this.canvas_height);
      this.ctx.stroke();
    }
    // Horizontal
    for (let i = 1; i <= this.totalSquaresHeight; i++) {
      this.ctx.moveTo(0, i * this.squareSize);
      this.ctx.lineTo(this.canvas_width, i * this.squareSize);
      this.ctx.stroke();
    }
  }
}

new Game();
