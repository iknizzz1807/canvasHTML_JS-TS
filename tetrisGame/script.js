var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var Game = /** @class */ (function () {
    function Game() {
        this.SHAPES = {
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
        // SRS Wall Kick Data
        this.WALL_KICK_DATA = {
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
        // Main canvas setup
        this.canvas_width = 300;
        this.canvas_height = 600;
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = this.canvas_width;
        this.canvas.height = this.canvas_height;
        // Preview canvas setup
        this.preview_size = 120;
        this.previewCanvas = document.getElementById("preview");
        this.previewCtx = this.previewCanvas.getContext("2d");
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
        // Set up event listeners
        document.addEventListener("keydown", this.handleKeyPress.bind(this));
        this.startGame();
    }
    Game.prototype.initializeBoard = function () {
        this.gameBoard = [];
        for (var i = 0; i < this.totalSquaresHeight; i++) {
            var row = [];
            for (var j = 0; j < this.totalSquaresWidth; j++) {
                row.push(0);
            }
            this.gameBoard.push(row);
        }
    };
    Game.prototype.createNewPiece = function () {
        var shapes = Object.keys(this.SHAPES);
        var randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        if (!this.nextPiece) {
            this.nextPiece = {
                shape: this.SHAPES[randomShape].shape,
                color: this.colors[randomShape],
                type: randomShape,
            };
        }
        var shapeData = this.SHAPES[this.nextPiece.type];
        this.currentPiece = {
            shape: this.nextPiece.shape,
            x: shapeData.startX,
            y: 0,
            color: this.nextPiece.color,
            type: this.nextPiece.type,
        };
        var nextRandomShape = shapes[Math.floor(Math.random() * shapes.length)];
        this.nextPiece = {
            shape: this.SHAPES[nextRandomShape].shape,
            color: this.colors[nextRandomShape],
            type: nextRandomShape,
        };
        this.updateGhostPiece();
        if (this.checkCollision()) {
            this.gameOver = true;
        }
    };
    Game.prototype.checkCollision = function (shape, x, y) {
        var _a, _b, _c;
        if (shape === void 0) { shape = (_a = this.currentPiece) === null || _a === void 0 ? void 0 : _a.shape; }
        if (x === void 0) { x = (_b = this.currentPiece) === null || _b === void 0 ? void 0 : _b.x; }
        if (y === void 0) { y = (_c = this.currentPiece) === null || _c === void 0 ? void 0 : _c.y; }
        if (!shape || x === undefined || y === undefined)
            return false;
        for (var row = 0; row < shape.length; row++) {
            for (var col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    var boardX = x + col;
                    var boardY = y + row;
                    if (boardX < 0 ||
                        boardX >= this.totalSquaresWidth ||
                        boardY >= this.totalSquaresHeight ||
                        (boardY >= 0 && this.gameBoard[boardY][boardX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    Game.prototype.rotatePiece = function (direction) {
        var _this = this;
        if (!this.currentPiece)
            return;
        var oldShape = this.currentPiece.shape.map(function (row) { return __spreadArray([], row, true); });
        var newShape;
        if (direction === 1) {
            // Clockwise
            newShape = this.currentPiece.shape[0].map(function (_, i) {
                return _this.currentPiece.shape.map(function (row) { return row[i]; }).reverse();
            });
        }
        else {
            // Counter-clockwise
            newShape = this.currentPiece.shape[0].map(function (_, i) {
                return _this.currentPiece.shape.map(function (row) { return row[row.length - 1 - i]; });
            });
        }
        var kicks = this.currentPiece.type === "I"
            ? this.WALL_KICK_DATA.I
            : this.WALL_KICK_DATA.JLSTZ;
        var kicked = false;
        this.currentPiece.shape = newShape;
        for (var _i = 0, _a = kicks[0]; _i < _a.length; _i++) {
            var _b = _a[_i], dx = _b[0], dy = _b[1];
            var newX = this.currentPiece.x + dx;
            var newY = this.currentPiece.y - dy;
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
    };
    Game.prototype.updateGhostPiece = function () {
        if (!this.currentPiece)
            return;
        this.ghostPiece = {
            x: this.currentPiece.x,
            y: this.currentPiece.y,
        };
        while (!this.checkCollision(this.currentPiece.shape, this.ghostPiece.x, this.ghostPiece.y + 1)) {
            this.ghostPiece.y++;
        }
    };
    Game.prototype.hardDrop = function () {
        if (!this.currentPiece || !this.ghostPiece)
            return;
        this.currentPiece.y = this.ghostPiece.y;
        this.mergePiece();
        this.clearLines();
        this.createNewPiece();
    };
    Game.prototype.handleKeyPress = function (event) {
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
                    }
                    else {
                        this.updateGhostPiece();
                    }
                }
                break;
            case "ArrowRight":
                if (this.currentPiece) {
                    this.currentPiece.x++;
                    if (this.checkCollision()) {
                        this.currentPiece.x--;
                    }
                    else {
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
    };
    Game.prototype.moveDown = function () {
        if (!this.currentPiece)
            return;
        this.currentPiece.y++;
        if (this.checkCollision()) {
            this.currentPiece.y--;
            this.mergePiece();
            this.clearLines();
            this.createNewPiece();
        }
    };
    Game.prototype.mergePiece = function () {
        if (!this.currentPiece)
            return;
        for (var y = 0; y < this.currentPiece.shape.length; y++) {
            for (var x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    var boardY = this.currentPiece.y + y;
                    if (boardY >= 0) {
                        this.gameBoard[boardY][this.currentPiece.x + x] = 1;
                    }
                }
            }
        }
    };
    Game.prototype.clearLines = function () {
        var linesCleared = 0;
        for (var y = this.totalSquaresHeight - 1; y >= 0; y--) {
            if (this.gameBoard[y].every(function (cell) { return cell === 1; })) {
                this.gameBoard.splice(y, 1);
                var newRow = [];
                for (var i = 0; i < this.totalSquaresWidth; i++) {
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
    };
    Game.prototype.drawBoard = function () {
        // Draw background
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.canvas_width, this.canvas_height);
        // Draw grid
        this.ctx.strokeStyle = "#333333";
        for (var i = 0; i <= this.totalSquaresWidth; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.squareSize, 0);
            this.ctx.lineTo(i * this.squareSize, this.canvas_height);
            this.ctx.stroke();
        }
        for (var i = 0; i <= this.totalSquaresHeight; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.squareSize);
            this.ctx.lineTo(this.canvas_width, i * this.squareSize);
            this.ctx.stroke();
        }
        // Draw placed pieces
        for (var y = 0; y < this.totalSquaresHeight; y++) {
            for (var x = 0; x < this.totalSquaresWidth; x++) {
                if (this.gameBoard[y][x]) {
                    this.ctx.fillStyle = "#808080";
                    this.ctx.fillRect(x * this.squareSize, y * this.squareSize, this.squareSize - 1, this.squareSize - 1);
                }
            }
        }
    };
    Game.prototype.drawGhostPiece = function () {
        if (!this.currentPiece || !this.ghostPiece)
            return;
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        for (var y = 0; y < this.currentPiece.shape.length; y++) {
            for (var x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    this.ctx.fillRect((this.ghostPiece.x + x) * this.squareSize, (this.ghostPiece.y + y) * this.squareSize, this.squareSize - 1, this.squareSize - 1);
                }
            }
        }
    };
    Game.prototype.drawCurrentPiece = function () {
        if (!this.currentPiece)
            return;
        this.ctx.fillStyle = this.currentPiece.color;
        for (var y = 0; y < this.currentPiece.shape.length; y++) {
            for (var x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    var boardX = this.currentPiece.x + x;
                    var boardY = this.currentPiece.y + y;
                    if (boardY >= 0) {
                        this.ctx.fillRect(boardX * this.squareSize, boardY * this.squareSize, this.squareSize - 1, this.squareSize - 1);
                    }
                }
            }
        }
    };
    Game.prototype.drawNextPiece = function () {
        if (!this.nextPiece)
            return;
        // Clear preview canvas
        this.previewCtx.fillStyle = "#000000";
        this.previewCtx.fillRect(0, 0, this.preview_size, this.preview_size);
        // Calculate scaling and centering
        var pieceWidth = this.nextPiece.shape[0].length;
        var pieceHeight = this.nextPiece.shape.length;
        var scale = Math.min((this.preview_size * 0.8) / (pieceWidth * this.squareSize), (this.preview_size * 0.8) / (pieceHeight * this.squareSize));
        var offsetX = (this.preview_size - pieceWidth * this.squareSize * scale) / 2;
        var offsetY = (this.preview_size - pieceHeight * this.squareSize * scale) / 2;
        // Draw next piece
        this.previewCtx.fillStyle = this.nextPiece.color;
        for (var y = 0; y < pieceHeight; y++) {
            for (var x = 0; x < pieceWidth; x++) {
                if (this.nextPiece.shape[y][x]) {
                    this.previewCtx.fillRect(offsetX + x * this.squareSize * scale, offsetY + y * this.squareSize * scale, this.squareSize * scale - 1, this.squareSize * scale - 1);
                }
            }
        }
        // Draw grid on preview
        this.previewCtx.strokeStyle = "#333333";
        for (var x = 0; x <= pieceWidth; x++) {
            this.previewCtx.beginPath();
            this.previewCtx.moveTo(offsetX + x * this.squareSize * scale, offsetY);
            this.previewCtx.lineTo(offsetX + x * this.squareSize * scale, offsetY + pieceHeight * this.squareSize * scale);
            this.previewCtx.stroke();
        }
        for (var y = 0; y <= pieceHeight; y++) {
            this.previewCtx.beginPath();
            this.previewCtx.moveTo(offsetX, offsetY + y * this.squareSize * scale);
            this.previewCtx.lineTo(offsetX + pieceWidth * this.squareSize * scale, offsetY + y * this.squareSize * scale);
            this.previewCtx.stroke();
        }
    };
    Game.prototype.drawScore = function () {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "20px Arial";
        this.ctx.textAlign = "left";
        this.ctx.fillText("Score: ".concat(this.score), 10, 30);
        this.ctx.fillText("Level: ".concat(Math.floor(this.score / 1000) + 1), 10, 60);
    };
    Game.prototype.drawGameOver = function () {
        if (!this.gameOver)
            return;
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        this.ctx.fillRect(0, 0, this.canvas_width, this.canvas_height);
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "40px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText("Game Over!", this.canvas_width / 2, this.canvas_height / 2 - 40);
        this.ctx.font = "20px Arial";
        this.ctx.fillText("Final Score: ".concat(this.score), this.canvas_width / 2, this.canvas_height / 2);
        this.ctx.fillText("Press 'R' to restart", this.canvas_width / 2, this.canvas_height / 2 + 40);
    };
    Game.prototype.draw = function () {
        this.drawBoard();
        this.drawGhostPiece();
        this.drawCurrentPiece();
        this.drawNextPiece();
        this.drawScore();
        this.drawGameOver();
    };
    Game.prototype.update = function (currentTime) {
        if (this.gameOver) {
            this.drawGameOver();
            return;
        }
        var deltaTime = currentTime - this.lastTime;
        if (deltaTime > this.dropTime) {
            this.moveDown();
            this.lastTime = currentTime;
        }
        this.draw();
        requestAnimationFrame(this.update.bind(this));
    };
    Game.prototype.startGame = function () {
        this.initializeBoard();
        this.score = 0;
        this.gameOver = false;
        this.dropTime = 1000;
        this.createNewPiece();
        this.lastTime = 0;
        requestAnimationFrame(this.update.bind(this));
    };
    return Game;
}());
new Game();
