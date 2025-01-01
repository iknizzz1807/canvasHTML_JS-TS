var Car = /** @class */ (function () {
    function Car(initialPosition, color) {
        if (color === void 0) { color = "blue"; }
        this.size = { width: 40, height: 80 };
        this.speed = 5;
        this.minSpeed = 3;
        this.maxSpeed = 8;
        this.acceleration = 0.1;
        this.position = initialPosition;
        this.color = color;
    }
    Car.prototype.draw = function (ctx) {
        // Car body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
        var wheelWidth = 8;
        var wheelHeight = 15;
        ctx.fillStyle = "black";
        ctx.fillRect(this.position.x - wheelWidth / 2, this.position.y + 10, wheelWidth, wheelHeight);
        ctx.fillRect(this.position.x + this.size.width - wheelWidth / 2, this.position.y + 10, wheelWidth, wheelHeight);
        ctx.fillRect(this.position.x - wheelWidth / 2, this.position.y + this.size.height - wheelHeight - 10, wheelWidth, wheelHeight);
        ctx.fillRect(this.position.x + this.size.width - wheelWidth / 2, this.position.y + this.size.height - wheelHeight - 10, wheelWidth, wheelHeight);
    };
    Car.prototype.move = function (keys, canvasWidth) {
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
            this.position.x = Math.min(canvasWidth - this.size.width, this.position.x + 5);
        }
    };
    Car.prototype.checkCollision = function (otherCar) {
        return !(this.position.x > otherCar.position.x + otherCar.size.width ||
            this.position.x + this.size.width < otherCar.position.x ||
            this.position.y > otherCar.position.y + otherCar.size.height ||
            this.position.y + this.size.height < otherCar.position.y);
    };
    return Car;
}());
var RoadLine = /** @class */ (function () {
    function RoadLine(position) {
        this.size = { width: 4, height: 30 };
        this.speed = 0;
        this.position = position;
    }
    RoadLine.prototype.draw = function (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
    };
    RoadLine.prototype.move = function (playerSpeed) {
        this.position.y += playerSpeed;
    };
    RoadLine.prototype.isOffScreen = function (canvasHeight) {
        return this.position.y > canvasHeight;
    };
    return RoadLine;
}());
var Game = /** @class */ (function () {
    function Game(canvasId) {
        this.trafficCars = [];
        this.roadLines = [];
        this.keys = { w: false, s: false, a: false, d: false };
        this.lastCarSpawnTime = 0;
        this.lastLineSpawnTime = 0;
        this.carSpawnInterval = 2000;
        this.lineSpawnInterval = 100;
        this.score = 0;
        this.gameOver = false;
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = 400;
        this.canvas.height = 600;
        this.playerCar = new Car({
            x: this.canvas.width / 2 - 20,
            y: this.canvas.height - 100,
        });
        this.setupEventListeners();
    }
    Game.prototype.setupEventListeners = function () {
        var _this = this;
        document.addEventListener("keydown", function (e) {
            var key = e.key.toLowerCase();
            if (key in _this.keys) {
                _this.keys[key] = true;
            }
        });
        document.addEventListener("keyup", function (e) {
            var key = e.key.toLowerCase();
            if (key in _this.keys) {
                _this.keys[key] = false;
            }
        });
    };
    Game.prototype.spawnTrafficCar = function () {
        var currentTime = Date.now();
        if (currentTime - this.lastCarSpawnTime > this.carSpawnInterval) {
            // Random lane selection (left or right side of the road)
            var lane = Math.random() < 0.5
                ? this.canvas.width / 4
                : (this.canvas.width * 3) / 4;
            var position = {
                x: lane - 20,
                y: -100,
            };
            this.trafficCars.push(new Car(position, "red"));
            this.lastCarSpawnTime = currentTime;
        }
    };
    Game.prototype.spawnRoadLine = function () {
        var currentTime = Date.now();
        if (currentTime - this.lastLineSpawnTime > this.lineSpawnInterval) {
            var position = {
                x: this.canvas.width / 2 - 2,
                y: -30,
            };
            this.roadLines.push(new RoadLine(position));
            this.lastLineSpawnTime = currentTime;
        }
    };
    Game.prototype.drawRoad = function () {
        // Nền đường
        this.ctx.fillStyle = "#333333";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Lề đường
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(20, 0, 5, this.canvas.height);
        this.ctx.fillRect(this.canvas.width - 25, 0, 5, this.canvas.height);
    };
    Game.prototype.drawSpeed = function () {
        this.ctx.fillStyle = "white";
        this.ctx.font = "16px Arial";
        this.ctx.fillText("Speed: ".concat(this.playerCar.speed.toFixed(1)), 10, 50);
    };
    Game.prototype.drawScore = function () {
        this.ctx.fillStyle = "white";
        this.ctx.font = "20px Arial";
        this.ctx.fillText("Score: ".concat(this.score), 10, 30);
    };
    Game.prototype.update = function () {
        var _this = this;
        if (this.gameOver) {
            return;
        }
        this.playerCar.move(this.keys, this.canvas.width);
        this.spawnTrafficCar();
        this.spawnRoadLine();
        this.trafficCars = this.trafficCars.filter(function (car) {
            car.position.y += _this.playerCar.speed;
            if (_this.playerCar.checkCollision(car)) {
                _this.gameOver = true;
            }
            if (car.position.y > _this.canvas.height) {
                _this.score++;
                return false;
            }
            return true;
        });
        this.roadLines = this.roadLines.filter(function (line) {
            line.move(_this.playerCar.speed);
            return !line.isOffScreen(_this.canvas.height);
        });
    };
    Game.prototype.draw = function () {
        var _this = this;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawRoad();
        this.roadLines.forEach(function (line) { return line.draw(_this.ctx); });
        this.trafficCars.forEach(function (car) { return car.draw(_this.ctx); });
        this.playerCar.draw(this.ctx);
        this.drawScore();
        this.drawSpeed();
        if (this.gameOver) {
            this.ctx.fillStyle = "white";
            this.ctx.font = "40px Arial";
            this.ctx.fillText("Game Over!", this.canvas.width / 2 - 100, this.canvas.height / 2);
            this.ctx.font = "20px Arial";
            this.ctx.fillText("Final Score: " + this.score, this.canvas.width / 2 - 50, this.canvas.height / 2 + 40);
        }
    };
    Game.prototype.gameLoop = function () {
        var _this = this;
        this.update();
        this.draw();
        requestAnimationFrame(function () { return _this.gameLoop(); });
    };
    Game.prototype.start = function () {
        this.gameLoop();
    };
    return Game;
}());
var game = new Game("canvas");
game.start();
