var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
if (ctx) {
    //
}
var Game = /** @class */ (function () {
    // each square is 30x30, so the game is 10x20 squares
    function Game() {
        this.canvas_width = 300;
        this.canvas_height = 600;
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = this.canvas_width;
        this.canvas.height = this.canvas_height;
        this.totalSquares = 200;
        this.squareSize = 30;
        this.totalSquaresHeight = 20;
        this.totalSquaresWidth = 10;
        this.clearCanvas();
        this.drawGrid();
    }
    Game.prototype.clearCanvas = function () {
        this.ctx.fillStyle = "aqua";
        this.ctx.fillRect(0, 0, this.canvas_width, this.canvas_height);
    };
    Game.prototype.drawGrid = function () {
        // Vertical
        this.ctx.strokeStyle = "white";
        for (var i = 1; i <= this.totalSquaresWidth; i++) {
            this.ctx.moveTo(i * this.squareSize, 0);
            this.ctx.lineTo(i * this.squareSize, this.canvas_height);
            this.ctx.stroke();
        }
        // Horizontal
        for (var i = 1; i <= this.totalSquaresHeight; i++) {
            this.ctx.moveTo(0, i * this.squareSize);
            this.ctx.lineTo(this.canvas_width, i * this.squareSize);
            this.ctx.stroke();
        }
    };
    return Game;
}());
new Game();
