var Vector2D = /** @class */ (function () {
    function Vector2D(x, y) {
        this.x = x;
        this.y = y;
    }
    return Vector2D;
}());
var Bullet = /** @class */ (function () {
    function Bullet(startPos, angle, power, wind) {
        this.gravity = 0.5;
        this.isActive = false;
        this.position = new Vector2D(startPos.x, startPos.y);
        var radian = (angle * Math.PI) / 180;
        this.velocity = new Vector2D((Math.cos(radian) * power) / 10, (-Math.sin(radian) * power) / 10);
        this.wind = wind;
    }
    Bullet.prototype.update = function () {
        if (!this.isActive)
            return;
        // Apply wind force
        this.velocity.x += this.wind * 0.01;
        // Apply gravity
        this.velocity.y += this.gravity;
        // Update position
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    };
    Bullet.prototype.draw = function (ctx) {
        if (!this.isActive)
            return;
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2);
        ctx.fill();
    };
    Bullet.prototype.shoot = function () {
        this.isActive = true;
    };
    Bullet.prototype.isOutOfBounds = function (width, height) {
        return (this.position.x < 0 ||
            this.position.x > width ||
            this.position.y < 0 ||
            this.position.y > height);
    };
    Bullet.prototype.getPosition = function () {
        return this.position;
    };
    Bullet.prototype.isShot = function () {
        return this.isActive;
    };
    return Bullet;
}());
var Enemy = /** @class */ (function () {
    function Enemy(pos) {
        this.width = 32;
        this.height = 32;
        this.health = 100;
        this.position = pos;
    }
    Enemy.prototype.draw = function (ctx) {
        // Draw enemy
        ctx.fillStyle = "red";
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        // Draw health bar
        ctx.fillStyle = "black";
        ctx.fillRect(this.position.x, this.position.y - 20, this.width, 10);
        ctx.fillStyle = "green";
        ctx.fillRect(this.position.x, this.position.y - 20, (this.width * this.health) / 100, 10);
    };
    Enemy.prototype.takeDamage = function (damage) {
        this.health = Math.max(0, this.health - damage);
    };
    Enemy.prototype.checkCollision = function (bulletPos) {
        return (bulletPos.x > this.position.x &&
            bulletPos.x < this.position.x + this.width &&
            bulletPos.y > this.position.y &&
            bulletPos.y < this.position.y + this.height);
    };
    Enemy.prototype.isDead = function () {
        return this.health <= 0;
    };
    return Enemy;
}());
var Player = /** @class */ (function () {
    function Player(spawnPos) {
        this.bullet = null;
        this.position = spawnPos;
        this.width = 32;
        this.height = 32;
    }
    Player.prototype.shoot = function (angle, power, wind) {
        if (this.bullet && this.bullet.isShot())
            return false;
        this.bullet = new Bullet(new Vector2D(this.position.x + this.width / 2, this.position.y), angle, power, wind);
        this.bullet.shoot();
        return true;
    };
    Player.prototype.update = function () {
        var _a;
        (_a = this.bullet) === null || _a === void 0 ? void 0 : _a.update();
    };
    Player.prototype.draw = function (ctx) {
        var _a;
        // Draw player
        ctx.fillStyle = "blue";
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        // Draw bullet
        (_a = this.bullet) === null || _a === void 0 ? void 0 : _a.draw(ctx);
    };
    Player.prototype.getBulletPosition = function () {
        var _a;
        return ((_a = this.bullet) === null || _a === void 0 ? void 0 : _a.getPosition()) || null;
    };
    Player.prototype.isBulletActive = function () {
        var _a;
        return ((_a = this.bullet) === null || _a === void 0 ? void 0 : _a.isShot()) || false;
    };
    Player.prototype.checkBulletOutOfBounds = function (width, height) {
        var _a;
        return ((_a = this.bullet) === null || _a === void 0 ? void 0 : _a.isOutOfBounds(width, height)) || false;
    };
    Player.prototype.resetBullet = function () {
        this.bullet = null;
    };
    Player.prototype.getPosition = function () {
        return this.position;
    };
    Player.prototype.getWidth = function () {
        return this.width;
    };
    Player.prototype.getHeight = function () {
        return this.height;
    };
    Player.prototype.moveLeft = function () {
        this.position.x -= 10;
    };
    Player.prototype.moveRight = function () {
        this.position.x += 10;
    };
    Player.prototype.moveUp = function () {
        this.position.y -= 10;
    };
    Player.prototype.moveDown = function () {
        this.position.y += 10;
    };
    return Player;
}());
var Game = /** @class */ (function () {
    function Game() {
        var _this = this;
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas_width = 1400;
        this.canvas_height = 700;
        this.canvas.width = this.canvas_width;
        this.canvas.height = this.canvas_height;
        this.degree = 0;
        this.power = 0;
        this.maxDegree = 180;
        this.maxPower = 500;
        this.powerDirection = 1;
        this.wind = 0;
        window.addEventListener("keydown", function (e) {
            if (e.key === "ArrowUp") {
                if (_this.degree < _this.maxDegree) {
                    _this.degree += 5;
                }
            }
            else if (e.key === "ArrowDown") {
                if (_this.degree > 0) {
                    _this.degree -= 5;
                }
            }
            else if (e.key === " ") {
                e.preventDefault();
                if (_this.power >= _this.maxPower) {
                    _this.powerDirection = -1;
                }
                else if (_this.power <= 0) {
                    _this.powerDirection = 1;
                }
                if (_this.powerDirection === 1)
                    _this.power += 10;
                else if (_this.powerDirection === -1)
                    _this.power -= 10;
            }
            else if (e.key === "w") {
                _this.player.moveUp();
            }
            else if (e.key === "a") {
                _this.player.moveLeft();
            }
            else if (e.key === "s") {
                _this.player.moveDown();
            }
            else if (e.key === "d") {
                _this.player.moveRight();
            }
        });
        var shootButton = document.getElementById("shootButton");
        shootButton === null || shootButton === void 0 ? void 0 : shootButton.addEventListener("click", function () {
            if (_this.player.shoot(_this.degree, _this.power, _this.wind)) {
                // Generate new random wind after successful shot
                _this.wind = (Math.random() - 0.5) * 2; // Random value between -1 and 1
            }
        });
        this.player = new Player(new Vector2D(100, this.canvas_height - 200));
        this.enemy = new Enemy(new Vector2D(this.canvas_width - 200, this.canvas_height - 200));
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
    }
    Game.prototype.drawBackGround = function () {
        if (this.ctx) {
            this.ctx.fillStyle = "#C9997D";
            this.ctx.fillRect(0, 0, this.canvas_width, this.canvas_height);
        }
    };
    Game.prototype.drawWind = function () {
        if (this.ctx) {
            this.ctx.fillStyle = "white";
            this.ctx.font = "20px Arial";
            this.ctx.fillText("".concat(this.wind.toFixed(2)), 20, 30);
            // Draw wind direction arrow
            var arrowLength = Math.abs(this.wind) * 50;
            var arrowX = 100;
            var arrowY = 25;
            this.ctx.beginPath();
            this.ctx.strokeStyle = "white";
            if (this.wind > 0) {
                this.ctx.fillStyle = "green";
                this.ctx.fillText(">>>>>>>>>>>", arrowX, arrowY + 5);
            }
            else {
                this.ctx.fillStyle = "green";
                this.ctx.fillText("<<<<<<<<<<<", arrowX, arrowY + 5);
            }
            this.ctx.stroke();
        }
    };
    Game.prototype.drawPower = function () {
        if (this.ctx) {
            this.powerDirection === 1
                ? (this.ctx.fillStyle = "green")
                : (this.ctx.fillStyle = "orange");
            this.ctx.fillRect(240, this.canvas_height - 40, this.power * 2, 20);
            this.ctx.strokeStyle = "white";
            this.ctx.strokeRect(240, this.canvas_height - 40, this.maxPower * 2, 20);
        }
    };
    Game.prototype.drawDegree = function () {
        if (this.ctx) {
            var radius = 80;
            this.ctx.beginPath();
            this.ctx.strokeStyle = "white";
            this.ctx.arc(120, this.canvas_height - 20, radius, Math.PI, 2 * Math.PI);
            this.ctx.lineWidth = 5;
            this.ctx.stroke();
            this.ctx.fillStyle = "black";
            this.ctx.font = "20px arial";
            this.ctx.fillText("90", 110, this.canvas_height - 80);
            this.ctx.fillText("180", 44, this.canvas_height - 24);
            this.ctx.fillText("0", 184, this.canvas_height - 24);
            this.ctx.beginPath();
            this.ctx.strokeStyle = "red";
            var radian = (this.degree * Math.PI) / 180;
            var centerX = 120;
            var centerY = this.canvas_height - 22;
            var x = centerX + radius * Math.cos(radian);
            var y = centerY - radius * Math.sin(radian);
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        }
    };
    Game.prototype.checkCollisions = function () {
        if (!this.ctx)
            return;
        var bulletPos = this.player.getBulletPosition();
        if (bulletPos && this.enemy.checkCollision(bulletPos)) {
            this.enemy.takeDamage(20);
            this.player.resetBullet();
            if (this.enemy.isDead()) {
                alert("You won!");
                // Reset game or handle win condition
            }
        }
    };
    Game.prototype.clearCanvas = function () {
        this.drawBackGround();
    };
    Game.prototype.gameLoop = function () {
        this.clearCanvas();
        // Update
        this.player.update();
        if (this.player.checkBulletOutOfBounds(this.canvas_width, this.canvas_height)) {
            this.player.resetBullet();
        }
        this.checkCollisions();
        // Draw
        this.drawWind();
        this.player.draw(this.ctx);
        this.enemy.draw(this.ctx);
        this.drawPower();
        this.drawDegree();
        requestAnimationFrame(this.gameLoop);
    };
    return Game;
}());
new Game();
