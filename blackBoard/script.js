class DrawingTool {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.isMousePressed = false;
  }

  onMouseDown() {}
  onMouseMove() {}
  onMouseUp() {}
  onMouseOut() {}
}

class LineTool extends DrawingTool {
  onMouseDown(x, y) {
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  onMouseMove(x, y) {
    if (this.isMousePressed) {
      this.ctx.strokeStyle = "white";
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
    }
  }

  onMouseUp() {
    this.ctx.closePath();
  }
}

class SquareTool extends DrawingTool {
  constructor(canvas, ctx) {
    super(canvas, ctx);
    this.startPos = { x: 0, y: 0 };
    this.canvasState = null;
  }

  onMouseDown(x, y) {
    this.startPos = { x, y };
    this.canvasState = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
  }

  onMouseMove(x, y) {
    if (this.isMousePressed) {
      this.ctx.putImageData(this.canvasState, 0, 0);
      this.ctx.beginPath();
      this.ctx.strokeRect(
        this.startPos.x,
        this.startPos.y,
        x - this.startPos.x,
        y - this.startPos.y
      );
    }
  }

  onMouseUp() {
    this.canvasState = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
  }
}

class EraserTool extends DrawingTool {
  onMouseDown(x, y) {
    this.erase(x, y);
  }

  onMouseMove(x, y) {
    if (this.isMousePressed) {
      this.erase(x, y);
    }
  }

  onMouseUp() {}

  erase(x, y) {
    this.ctx.clearRect(x - 10, y - 10, 20, 20); // Erase a 20x20 square
  }
}

class DrawingApp {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.oldWidth = 0;
    this.oldHeight = 0;
    this.setupEventListeners();
    this.setupCanvas();
    this.setupTools();
  }

  setupCanvas() {
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = "round";
    this.ctx.strokeStyle = "white";
    this.canvas.height = window.innerHeight - 8;
    this.canvas.width = window.innerWidth - 100;
  }

  setupTools() {
    this.tools = {
      line: new LineTool(this.canvas, this.ctx),
      square: new SquareTool(this.canvas, this.ctx),
      eraser: new EraserTool(this.canvas, this.ctx),
    };
    this.currentTool = this.tools.line;
  }

  setupEventListeners() {
    window.addEventListener("resize", () => this.resizeCanvas());

    document.getElementById("line-btn").addEventListener("click", () => {
      this.currentTool = this.tools.line;
    });

    document.getElementById("square-btn").addEventListener("click", () => {
      this.currentTool = this.tools.square;
    });

    document.getElementById("eraser-btn").addEventListener("click", () => {
      this.currentTool = this.tools.eraser;
    });

    document.getElementById("clear-btn").addEventListener("click", () => {
      this.clearCanvas();
    });

    this.canvas.addEventListener("mousedown", (e) => {
      this.currentTool.isMousePressed = true;
      const { x, y } = this.getMousePos(e);
      this.currentTool.onMouseDown(x, y);
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (!this.currentTool.isMousePressed) return;
      const { x, y } = this.getMousePos(e);
      this.currentTool.onMouseMove(x, y);
    });

    this.canvas.addEventListener("mouseup", () => {
      this.currentTool.isMousePressed = false;
      this.currentTool.onMouseUp();
      this.ctx.beginPath();
    });

    this.canvas.addEventListener("mouseout", () => {
      this.currentTool.isMousePressed = false;
      this.currentTool.onMouseOut();
      this.ctx.beginPath();
    });
  }

  getMousePos(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  resizeCanvas() {
    // Save the current canvas content
    const imageData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    // Resize the canvas
    this.canvas.height = window.innerHeight - 8;
    this.canvas.width = window.innerWidth - 100;

    // Restore the canvas content
    this.ctx.putImageData(imageData, 0, 0);
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

// Initialize the app
const app = new DrawingApp();
