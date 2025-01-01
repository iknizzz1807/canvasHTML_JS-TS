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
    this.ctx.strokeStyle = "white";
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
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
    this.ctx.putImageData(this.canvasState, 0, 0);
    this.ctx.beginPath();
    this.ctx.strokeRect(
      this.startPos.x,
      this.startPos.y,
      x - this.startPos.x,
      y - this.startPos.y
    );
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

class DrawingApp {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.setupCanvas();
    this.setupTools();
    this.setupEventListeners();
  }

  setupCanvas() {
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = "round";
    this.ctx.strokeStyle = "white";
    this.resizeCanvas();
  }

  setupTools() {
    this.tools = {
      line: new LineTool(this.canvas, this.ctx),
      square: new SquareTool(this.canvas, this.ctx),
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
    this.canvas.height = window.innerHeight - 8;
    this.canvas.width = window.innerWidth - 100;
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

// Initialize the app
const app = new DrawingApp();
