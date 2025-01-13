var Vector2D = /** @class */ (function () {
    function Vector2D(x, y) {
        this.x = x;
        this.y = y;
    }
    return Vector2D;
}());
var Bullet = /** @class */ (function () {
    function Bullet() {
    }
    return Bullet;
}());
var Player = /** @class */ (function () {
    function Player(spawnPos) {
        this.position = spawnPos;
        this.width = 32;
        this.height = 32;
        this.canShoot = true;
    }
    Player.prototype.shoot = function () {
        if (this.canShoot) {
            this.canShoot = false;
            // shoot
        }
    };
    Player.prototype.move = function (direction) {
        if (direction === "left") {
            this.position.x -= 2;
        }
        else if (direction === "right") {
            this.position.x += 2;
        }
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
        this.maxPower = 100;
        window.addEventListener("keydown", function (e) {
            if (e.key === " ") {
                if (_this.power < _this.maxPower)
                    _this.power += 2;
            }
        });
        this.drawBackGround();
        this.player = new Player(new Vector2D(100, this.canvas_height - 200));
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
    }
    Game.prototype.drawBackGround = function () {
        if (this.ctx) {
            this.ctx.fillStyle = "#C9997D";
            this.ctx.fillRect(0, 0, this.canvas_width, this.canvas_height);
        }
    };
    Game.prototype.drawPlayer = function () {
        if (this.ctx) {
            var pos = this.player.getPosition();
            var width = this.player.getWidth();
            var height = this.player.getHeight();
            this.ctx.fillStyle = "blue";
            this.ctx.fillRect(pos.x, pos.y, width, height);
        }
    };
    Game.prototype.drawPower = function () {
        if (this.ctx) {
            this.ctx.fillStyle = "green";
            this.ctx.fillRect(240, this.canvas_height - 40, this.power * 10, 20);
            this.ctx.strokeStyle = "white";
            this.ctx.strokeRect(240, this.canvas_height - 40, this.maxPower * 10, 20);
        }
    };
    Game.prototype.drawDegree = function () {
        if (this.ctx) {
            this.ctx.beginPath();
            this.ctx.arc(120, this.canvas_height - 20, 80, Math.PI, 2 * Math.PI);
            this.ctx.fillStyle = "transparent";
            this.ctx.fill();
            this.ctx.lineWidth = 5;
            this.ctx.stroke();
        }
    };
    Game.prototype.clearCanvas = function () {
        this.drawBackGround();
    };
    Game.prototype.gameLoop = function () {
        this.clearCanvas();
        this.drawPlayer();
        this.drawPower();
        this.drawDegree();
        requestAnimationFrame(this.gameLoop);
    };
    return Game;
}());
new Game();
