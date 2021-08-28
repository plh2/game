let ctx;
let root;
class Brick {
    constructor(x, y, l = 3) {
        this.x = x;
        this.y = y;
        this.level = l;
        this.size = 10;
    }
    draw() {
        ctx.beginPath();
        if (this.level === 3) {
            ctx.fillStyle = "#999";
        }
        if (this.level === 2) {
            ctx.fillStyle = "#666";
        }
        if (this.level === 1) {
            ctx.fillStyle = "#333";
        }
        ctx.fillRect(this.x + 1, this.y + 1, this.size - 1, this.size - 1);
        ctx.stroke();
    }
    destory() {
        root.data.bricks = root.data.bricks.filter(brick => brick!== this)
        if (Math.random() < root.data.foodGenerateRate) {
            root.data.foods.push(new Food(this.x, this.y));
        }
    }
}

class Ball {
    constructor({ x, y, direct = Math.random()*2 }) {
        this.x = x;
        this.y = y;
        // 0    →
        // 0.5  ↑
        // 1    ←
        // 1.5  ↓
        this.direct = direct;
        this.speed = 1;
        this.size = 3;
        this.root = root;
    }
    boundaryCollision() {
        this.direct += 2;
        this.direct %= 2;
        // boundary left
        if (this.x - this.size < 0) {
            this.direct = 1 - this.direct;
            return true;
        }
        // boundary right
        if (this.x + this.size > root.data.width) {
            this.direct = 1 - this.direct;
            return true;
        }
        // boundary top
        if (this.y - this.size < 0) {
            this.direct = 2 - this.direct;
            return true;
        }
        // boundary down
        if (this.y > root.data.height) {
            this.destory()
            return;
        }
        return false;
    }
    brickCollision() {
        this.direct += 2;
        this.direct %= 2;
        for (let i = 0; i < root.data.bricks.length; i++) {
            const brick = root.data.bricks[i];
            if (
                brick.x < this.x &&
                this.x < brick.x + brick.size &&
                brick.y < this.y + this.size &&
                this.y - this.size < brick.y + brick.size
            ) {
                this.direct = 2 - this.direct;
                if (brick.level > 1) {
                    brick.level--;
                } else {
                    brick.destory();
                }
                return true;
            }
            if (
                brick.y < this.y &&
                this.y < brick.y + brick.size &&
                brick.x < this.x + this.size &&
                this.x - this.size < brick.x + brick.size
            ) {
                this.direct = 1 - this.direct;
                if (brick.level > 1) {
                    brick.level--;
                } else {
                    brick.destory();
                }
                return true;
            }
        }
        return false;
    }
    destory() {
        root.data.balls = root.data.balls.filter(ball => ball!== this)
    }
    paddleCollision() {
        this.direct += 2;
        this.direct %= 2;
        const paddle = root.data.paddle;
        if (
            paddle.x < this.x + this.size &&
            this.x < paddle.x + paddle.width &&
            paddle.y < this.y + this.size &&
            paddle.y + paddle.height > this.y + this.size
        ) {
            const effect = (0.5 - (this.x - paddle.x) / paddle.width) / 2;
            if (this.direct > 1 && this.direct < 2) {
                function format(deg) {
                    if (deg<0.2) return 0.2
                    if (deg>0.8) return 0.8
                    return deg
                }
                this.direct = format(2 - this.direct + effect);
                return true;
            }
        }
        return false;
    }
    move() {
        this.x += this.speed * Math.cos(this.direct * Math.PI);
        this.y -= this.speed * Math.sin(this.direct * Math.PI);
        if (this.brickCollision()) return;
        if (this.paddleCollision()) return;
        if (this.boundaryCollision()) return;
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.arc(this.x + 1, this.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
    }
    split() {
        if(root.data.balls.length < 200) {
            root.data.balls.push(new Ball({...this, direct: undefined }))
        }
    }
}

class Food {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.type = Math.floor(Math.random() * 4);
        this.size = 10;
        this.speed = 0.4;
    }
    paddleCollision() {
        const paddle = root.data.paddle;
        if (
            paddle.x <= this.x+this.size &&
            this.x <= paddle.x + paddle.width &&
            paddle.y <= this.y + this.size &&
            paddle.y + paddle.height >= this.y + this.size
        ) {
            return true;
        }
        return false;
    }
    move() {
        if (this.y > root.data.height) {
            this.destory();
            return
        }
        if (!this.paddleCollision()) {
            this.y += this.speed;
        } else {
            if (this.type === 0) {
                root.addBall()
            }
            if (this.type === 1) {
                root.addBall()
                root.addBall()
            }
            if (this.type === 2) {
                root.multipleBall()
            }
            if (this.type === 3) {
                root.multipleBall()
                root.multipleBall()
            }
            this.destory();
        }
    }
    destory() {
        root.data.foods = root.data.foods.filter((food) => food !== this);
    }
    draw() {
        ctx.beginPath();
        ctx.font = "10px Arial";
        ctx.fillStyle = "red";
        if (this.type === 0) {
            ctx.fillText("+1", this.x, this.y + this.size);
        }
        if (this.type === 1) {
            ctx.fillText("+2", this.x, this.y + this.size);
        }
        if (this.type === 2) {
            ctx.fillText("x2", this.x, this.y + this.size);
        }
        if (this.type === 3) {
            ctx.fillText("x3", this.x, this.y + this.size);
        }
        ctx.stroke();
    }
}

// 挡板
class Paddle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 4;
        this.speed = 15;
        this.eventListener();
    }
    eventListener() {
        document.addEventListener(
            "keydown",
            ($event) => {
                const code = $event.keyCode;
                if (code === 37) {
                    this.move(false);
                }
                if (code === 39) {
                    this.move(true);
                }
            },
            false
        );
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.stroke();
    }
    move(isRight) {
        if (isRight) {
            if (this.x + this.width < root.data.width) {
                this.x += this.speed;
            }
        } else {
            if (this.x > 0) {
                this.x -= this.speed;
            }
        }
    }
}

root = {
    data: {
        ctx: document.querySelector("canvas"),
        balls: [],
        bricks: [],
        foods: [],
        foodGenerateRate: 0.6,
        refreshSpeed: 1,
        width: 1100,
        height: 600,
        paddle: null,
    },
    init() {
        this.data.paddle = new Paddle(this.data.width/2, this.data.height - 20)
        Array(12)
            .fill(1)
            .forEach((_, j) => {
                Array(this.data.width / 10)
                    .fill(1)
                    .forEach((_, i) => {
                        this.data.bricks.push(new Brick(i * 10, j * 10, 1));
                    });
            });
        this.addBall()
        this.data.ctx.width = this.data.width;
        this.data.ctx.height = this.data.height;
        this.data.ctx = this.data.ctx.getContext("2d");
        ctx = this.data.ctx;
        this.timer = setInterval(() => {
            this.drawBackground();
            this.ballMove();
            this.drawBrick();
            this.drawFood();
            this.data.paddle.draw();
        }, this.data.refreshSpeed);
    },
    drawBackground() {
        const ctx = this.data.ctx;
        ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.data.width, this.data.height);
        ctx.stroke();
    },
    ballMove() {
        this.data.balls.forEach((ball) => {
            ball.move();
            ball.draw();
        });
    },
    drawPaddle() {
        this.data.padddle.draw();
    },
    drawBrick() {
        this.data.bricks.forEach((brick) => brick.draw());
    },
    drawFood () {
        this.data.foods.forEach((food) => {
            food.move();
            food.draw();
        });
    },
    addBall() {
        this.data.balls.push(new Ball({
            x: this.data.paddle.x + this.data.paddle.width / 2,
            y: this.data.paddle.y,
            direct: (Math.random()-0.5)/2 +0.5,
        }))
    },
    multipleBall() {
        this.data.balls.forEach(ball => ball.split())
    }
};

root.init();
