var Vector2D = /** @class */ (function () {
    function Vector2D(x, y) {
        this.x = x;
        this.y = y;
    }
    return Vector2D;
}());
var Canvas = /** @class */ (function () {
    function Canvas() {
        this.canvas = document.getElementById("canvas");
        if (this.canvas) {
            this.ctx = this.canvas.getContext("2d");
        }
        if (!this.ctx)
            return;
        var CANVAS_WIDTH = 1400;
        var CANVAS_HEIGHT = 700;
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        this.drawBackground();
    }
    Canvas.prototype.getCanvas = function () {
        return this.canvas;
    };
    Canvas.prototype.getCtx = function () {
        if (this.ctx)
            return this.ctx;
    };
    Canvas.prototype.drawBackground = function () {
        if (this.ctx) {
            this.ctx.fillStyle = "#F8E3D3";
            this.ctx.fillRect(0, 0, 1400, 700);
        }
    };
    Canvas.prototype.drawSquare = function (startPos, width, height, color) {
        if (this.ctx) {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(startPos.x, startPos.y, width, height);
        }
    };
    Canvas.prototype.drawLine = function (startPos, endPos, color) {
        if (this.ctx) {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.moveTo(startPos.x, startPos.y);
            this.ctx.lineTo(endPos.x, endPos.y);
            this.ctx.stroke();
        }
    };
    Canvas.prototype.drawImage = function (image, pos, width, height) {
        if (this.ctx) {
            this.ctx.drawImage(image, pos.x, pos.y, width, height);
        }
    };
    Canvas.prototype.drawScore = function (score) {
        if (this.ctx) {
            this.ctx.fillStyle = "black";
            this.ctx.font = "40px serif";
            this.ctx.fillText("Score: " + score.toString(), 40, 40);
        }
    };
    Canvas.prototype.showGameOver = function (score) {
        if (this.ctx) {
            this.ctx.fillStyle = "green";
            this.ctx.font = "40px serif";
            this.ctx.fillText("Game over!", this.canvas.width / 2 - 80, this.canvas.height / 2 - 10);
            this.ctx.fillStyle = "blue";
            this.ctx.font = "32px serif";
            this.ctx.fillText("Score: " + score.toString(), this.canvas.width / 2 - 40, this.canvas.height / 2 + 30);
            this.ctx.fillStyle = "orange";
            this.ctx.font = "40px serif";
            this.ctx.fillText("Space to restart", this.canvas.width / 2 - 90, this.canvas.height / 2 + 80);
        }
    };
    Canvas.prototype.clearCanvas = function () {
        if (this.ctx) {
            this.drawBackground();
        }
    };
    return Canvas;
}());
var Player = /** @class */ (function () {
    function Player(spawnPos) {
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
    Player.prototype.loadAssets = function () {
        for (var i = 0; i < 3; i++) {
            var img_1 = new Image();
            img_1.src = "assets/shark_00".concat(i, ".png");
            this.frames.push(img_1);
        }
        var img = new Image();
        img.src = "assets/shark_001.png";
        this.frames.push(img);
    };
    Player.prototype.update = function (deltaTime) {
        this.frameTimer += deltaTime;
        if (this.frameTimer >= this.frameInterval) {
            this.frameTimer = 0;
            this.frameIndex += 1;
            if (this.frameIndex >= this.frames.length)
                this.frameIndex = 0;
        }
        this.moveTimer += deltaTime;
        this.slowStartTimer += deltaTime;
        if (this.moveTimer >= this.moveInterval) {
            if (this.slowStartTimer <= 2000) {
                this.position.x += 1;
                this.state === "up" ? (this.position.y -= 2) : (this.position.y += 2);
            }
            else {
                if (this.position.x <= 700)
                    this.position.x += 2;
                this.state === "up" ? (this.position.y -= 4) : (this.position.y += 4);
            }
        }
    };
    Player.prototype.toggleState = function () {
        this.state === "up" ? (this.state = "down") : (this.state = "up");
    };
    Player.prototype.getPosition = function () {
        return this.position;
    };
    Player.prototype.getState = function () {
        return this.state;
    };
    Player.prototype.getCurrentFrame = function () {
        this.currentFrame = this.frames[this.frameIndex];
        return this.currentFrame;
    };
    Player.prototype.getBounds = function () {
        return {
            x: this.position.x + 20,
            y: this.position.y + 20,
            width: 30,
            height: 45,
        };
    };
    return Player;
}());
var Trail = /** @class */ (function () {
    function Trail(color) {
        this.points = [];
        this.color = color;
        this.reachMiddle = false;
    }
    Trail.prototype.addPoint = function (point) {
        this.points.push(new Vector2D(point.x, point.y));
        if (this.reachMiddle) {
            for (var i = 0; i < this.points.length; i++) {
                this.points[i].x -= 2;
            }
            this.points.shift();
        }
        if (point.x >= 700) {
            this.reachMiddle = true;
        }
    };
    Trail.prototype.draw = function (ctx) {
        if (this.points.length < 2)
            return;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (var i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.stroke();
    };
    return Trail;
}());
var Obstacle = /** @class */ (function () {
    function Obstacle(position, size, color, isTop) {
        this.position = position;
        this.size = size;
        this.color = color;
        this.isTop = isTop;
    }
    // Helper function to determine if a point is inside the triangle
    Obstacle.prototype.pointInTriangle = function (point) {
        var p1, p2, p3;
        if (this.isTop) {
            p1 = new Vector2D(this.position.x, this.position.y); // Top-left
            p2 = new Vector2D(this.position.x + this.size, this.position.y); // Top-right
            p3 = new Vector2D(this.position.x + this.size / 2, this.position.y + this.size); // Bottom-middle
        }
        else {
            p1 = new Vector2D(this.position.x, this.position.y); // Bottom-left
            p2 = new Vector2D(this.position.x + this.size, this.position.y); // Bottom-right
            p3 = new Vector2D(this.position.x + this.size / 2, this.position.y - this.size); // Top-middle
        }
        var areaOrig = Math.abs((p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y));
        var area1 = Math.abs((p1.x - point.x) * (p2.y - point.y) - (p2.x - point.x) * (p1.y - point.y));
        var area2 = Math.abs((p2.x - point.x) * (p3.y - point.y) - (p3.x - point.x) * (p2.y - point.y));
        var area3 = Math.abs((p3.x - point.x) * (p1.y - point.y) - (p1.x - point.x) * (p3.y - point.y));
        return Math.abs(area1 + area2 + area3 - areaOrig) < 0.01;
    };
    Obstacle.prototype.lineIntersects = function (l1p1, l1p2, l2p1, l2p2) {
        var denominator = (l2p2.y - l2p1.y) * (l1p2.x - l1p1.x) -
            (l2p2.x - l2p1.x) * (l1p2.y - l1p1.y);
        if (denominator === 0)
            return false;
        var ua = ((l2p2.x - l2p1.x) * (l1p1.y - l2p1.y) -
            (l2p2.y - l2p1.y) * (l1p1.x - l2p1.x)) /
            denominator;
        var ub = ((l1p2.x - l1p1.x) * (l1p1.y - l2p1.y) -
            (l1p2.y - l1p1.y) * (l1p1.x - l2p1.x)) /
            denominator;
        return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
    };
    Obstacle.prototype.checkCollision = function (playerBounds) {
        // Get triangle vertices
        var p1, p2, p3;
        if (this.isTop) {
            p1 = new Vector2D(this.position.x, this.position.y);
            p2 = new Vector2D(this.position.x + this.size, this.position.y);
            p3 = new Vector2D(this.position.x + this.size / 2, this.position.y + this.size);
        }
        else {
            p1 = new Vector2D(this.position.x, this.position.y);
            p2 = new Vector2D(this.position.x + this.size, this.position.y);
            p3 = new Vector2D(this.position.x + this.size / 2, this.position.y - this.size);
        }
        // Get player corners
        var playerCorners = [
            new Vector2D(playerBounds.x, playerBounds.y),
            new Vector2D(playerBounds.x + playerBounds.width, playerBounds.y),
            new Vector2D(playerBounds.x + playerBounds.width, playerBounds.y + playerBounds.height),
            new Vector2D(playerBounds.x, playerBounds.y + playerBounds.height),
        ];
        // Check if any player corner is inside the triangle
        for (var _i = 0, playerCorners_1 = playerCorners; _i < playerCorners_1.length; _i++) {
            var corner = playerCorners_1[_i];
            if (this.pointInTriangle(corner)) {
                return true;
            }
        }
        // Check if any triangle edge intersects with any player edge
        var triangleEdges = [
            [p1, p2],
            [p2, p3],
            [p3, p1],
        ];
        var playerEdges = [
            [playerCorners[0], playerCorners[1]],
            [playerCorners[1], playerCorners[2]],
            [playerCorners[2], playerCorners[3]],
            [playerCorners[3], playerCorners[0]],
        ];
        for (var _a = 0, triangleEdges_1 = triangleEdges; _a < triangleEdges_1.length; _a++) {
            var _b = triangleEdges_1[_a], t1 = _b[0], t2 = _b[1];
            for (var _c = 0, playerEdges_1 = playerEdges; _c < playerEdges_1.length; _c++) {
                var _d = playerEdges_1[_c], p1_1 = _d[0], p2_1 = _d[1];
                if (this.lineIntersects(t1, t2, p1_1, p2_1)) {
                    return true;
                }
            }
        }
        return false;
    };
    Obstacle.prototype.update = function (deltaTime) {
        this.position.x -= 4; // Move the obstacle to the left
    };
    Obstacle.prototype.draw = function (ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        if (this.isTop) {
            ctx.moveTo(this.position.x, this.position.y);
            ctx.lineTo(this.position.x + this.size, this.position.y);
            ctx.lineTo(this.position.x + this.size / 2, this.position.y + this.size);
        }
        else {
            ctx.moveTo(this.position.x, this.position.y);
            ctx.lineTo(this.position.x + this.size, this.position.y);
            ctx.lineTo(this.position.x + this.size / 2, this.position.y - this.size);
        }
        ctx.closePath();
        ctx.fill();
    };
    Obstacle.prototype.isOffScreen = function () {
        return this.position.x + this.size < 0;
    };
    Obstacle.prototype.getBounds = function () {
        return {
            x: this.position.x,
            y: this.isTop ? this.position.y : this.position.y - this.size,
            width: this.size,
            height: this.size,
        };
    };
    return Obstacle;
}());
var Game = /** @class */ (function () {
    function Game() {
        var _this = this;
        this.canvas = new Canvas();
        this.player = new Player(new Vector2D(0, this.canvas.getCanvas().height / 2));
        this.trail = new Trail("lightblue");
        this.lastTime = 0;
        this.obstacles = [];
        this.gameOver = false;
        this.score = 0;
        this.spawnObstableTimeoutID = 0;
        this.canvas.getCanvas().addEventListener("mousedown", function () {
            _this.player.toggleState();
        });
        window.addEventListener("keydown", function (e) {
            if (_this.gameOver && e.key === " ") {
                _this.restartGame();
            }
        });
        this.spawnObstacle();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    Game.prototype.spawnObstacle = function () {
        var _this = this;
        var canvasHeight = this.canvas.getCanvas().height;
        var canvasWidth = this.canvas.getCanvas().width;
        var minSize = 200;
        var maxSize = canvasHeight / 2 - 80;
        var size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
        var color = "red";
        var isTop = Math.random() < 0.5;
        var position = new Vector2D(canvasWidth, isTop ? 0 : canvasHeight);
        var obstacle = new Obstacle(position, size, color, isTop);
        this.obstacles.push(obstacle);
        var minDelay = 400;
        var maxDelay = 800;
        var delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
        this.spawnObstableTimeoutID = setTimeout(function () { return _this.spawnObstacle(); }, delay);
    };
    Game.prototype.gameLoop = function (timestamp) {
        var _this = this;
        if (this.gameOver) {
            this.canvas.showGameOver(this.score);
            this.score = 0;
            window.clearTimeout(this.spawnObstableTimeoutID);
            return;
        }
        var deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.canvas.clearCanvas();
        // Add current player position to trail
        this.trail.addPoint(new Vector2D(this.player.getPosition().x, this.player.getPosition().y + 40));
        // Draw the trail
        var ctx = this.canvas.getCtx();
        if (ctx) {
            this.trail.draw(ctx);
        }
        // Draw the player
        this.canvas.drawImage(this.player.getCurrentFrame(), this.player.getPosition(), 80, 80);
        // Update and draw the obstacles
        this.obstacles = this.obstacles.filter(function (obstacle) {
            obstacle.update(deltaTime);
            if (ctx) {
                obstacle.draw(ctx);
            }
            if (obstacle.getBounds().x + obstacle.getBounds().width <
                _this.player.getPosition().x) {
                _this.score++;
            }
            return !obstacle.isOffScreen();
        });
        // Check for collisions
        var playerBounds = this.player.getBounds();
        for (var _i = 0, _a = this.obstacles; _i < _a.length; _i++) {
            var obstacle = _a[_i];
            if (obstacle.checkCollision(playerBounds)) {
                this.gameOver = true;
            }
        }
        // Draw score
        this.canvas.drawScore(this.score);
        if (this.player.getPosition().y <= 0 ||
            this.player.getPosition().y + 60 >= this.canvas.getCanvas().height)
            this.gameOver = true;
        this.player.update(deltaTime);
        requestAnimationFrame(this.gameLoop.bind(this));
    };
    Game.prototype.restartGame = function () {
        this.obstacles = [];
        this.canvas.clearCanvas();
        this.player = new Player(new Vector2D(0, this.canvas.getCanvas().height / 2));
        this.trail = new Trail("lightblue");
        this.gameOver = false;
        this.lastTime = performance.now();
        this.score = 0;
        this.spawnObstacle();
        requestAnimationFrame(this.gameLoop.bind(this));
    };
    return Game;
}());
new Game();
