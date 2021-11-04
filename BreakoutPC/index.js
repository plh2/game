const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
let root;

class AudioClass {
    constructor() {
        this.init();
    }
    async init() {
        var audio = new Audio("./hit.wav");
        audio.play();
    }
}
class Brick {
    constructor(x, y, l = 3, size = 10) {
        this.x = x;
        this.y = y;
        this.level = l;
        this.size = size;
    }
    draw() {
        ctx.beginPath();
        if (this.level >= 3) {
            ctx.fillStyle = "#999";
        }
        if (this.level === 2) {
            ctx.fillStyle = "#e60109";
        }
        if (this.level === 1) {
            ctx.fillStyle = "#16ff05";
        }
        ctx.fillRect(this.x + 1, this.y + 1, this.size - 1, this.size - 1);
        ctx.stroke();
    }
    destory() {
        root.data.bricks = root.data.bricks.filter((brick) => brick !== this);
        if (Math.random() < root.data.foodGenerateRate) {
            root.data.foods.push(new Food(this.x, this.y));
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
            paddle.x <= this.x + this.size &&
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
            return;
        }
        if (!this.paddleCollision()) {
            this.y += this.speed;
        } else {
            if (this.type === 0) {
                root.addBall();
            }
            if (this.type === 1) {
                root.addBall();
                root.addBall();
            }
            if (this.type === 2) {
                root.multipleBall();
            }
            if (this.type === 3) {
                root.multipleBall();
                root.multipleBall();
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
            "mousemove",
            ($event) => {
                let nextLeft =
                    ($event.x / window.innerWidth) * root.data.width -
                    this.width / 2;
                let nextRight =
                    ($event.x / window.innerWidth) * root.data.width;
                if (nextLeft < 0) nextLeft = 0;
                if (nextRight > root.data.width - this.width / 2)
                    nextLeft = root.data.width - this.width;
                this.x = nextLeft;
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

class Ball {
    constructor({ x, y, direct = Math.random() * 2, speed = 10, size = 7 }) {
        this.x = x;
        this.y = y;
        // 0    →
        // 0.5  ↑
        // 1    ←
        // 1.5  ↓
        this.direct = direct;
        this.speed = speed;
        this.size = size;
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
            this.destory();
            return;
        }
        return false;
    }
    brickCollision() {
        this.direct += 2;
        this.direct %= 2;
        for (let i = 0; i < root.data.bricks.length; i++) {
            const brick = root.data.bricks[i];
            // this -> ball
            const ball = this;
            // up down collision check
            const closestPointX =
                ball.x < brick.x
                    ? brick.x
                    : ball.x < brick.x + brick.size
                    ? ball.x
                    : brick.x + brick.size;
            const closestPointY =
                ball.y < brick.y
                    ? brick.y
                    : ball.y < brick.y + brick.size
                    ? ball.y
                    : brick.y + brick.size;
            var distance = Math.sqrt(
                Math.pow(closestPointX - ball.x, 2) +
                    Math.pow(closestPointY - ball.y, 2)
            );
            if (distance <= ball.size) {
                // console.log(distance, ball.size);
                // 1. reset ball position
                // 2. turn around the ball position
                // direct angle
                const d_x1 = Math.cos(this.direct * Math.PI);
                const d_y1 = -Math.sin(this.direct * Math.PI);
                const direct_1 = Math.atan2(-d_y1, d_x1) / Math.PI;
                // surface angle
                const d_x2 = (ball.x - closestPointX) / ball.size;
                const d_y2 = (ball.y - closestPointY) / ball.size;
                const direct_2 = Math.atan2(-d_y2, d_x2) / Math.PI;
                ball.x =
                    closestPointX + ball.size * Math.cos(direct_2 * Math.PI);
                ball.y =
                    closestPointY - ball.size * Math.sin(direct_2 * Math.PI);
                function angleReflect(incidenceAngle, surfaceAngle) {
                    const a = surfaceAngle * 2 - incidenceAngle;
                    return a >= 2 ? a - 2 : a < 0 ? a + 2 : a;
                }
                this.direct = angleReflect(direct_1, direct_2 + 0.5);
                new AudioClass();
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
        root.data.balls = root.data.balls.filter((ball) => ball !== this);
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
                new AudioClass();
                function format(deg) {
                    if (deg < 0.2) return 0.2;
                    if (deg > 0.8) return 0.8;
                    return deg;
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
        if (this.paddleCollision()) return;
        if (this.boundaryCollision()) return;
        if (this.brickCollision()) return;
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.arc(this.x + 1, this.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
    }
    split() {
        if (root.data.balls.length < 400) {
            root.data.balls.push(new Ball({ ...this, direct: undefined }));
        }
    }
}

root = {
    constants: {
        BRICKS_MAP: "bricks_map",
    },
    data: {
        balls: [],
        bricks: [],
        foods: [],
        foodGenerateRate: 0.2,
        refreshSpeed: 1,
        width: 1100,
        height: 600,
        paddle: null,
    },
    async initMap() {
        let data = localStorage.getItem(this.constants.BRICKS_MAP);
        if (data) {
            data = JSON.parse(data);
        } else {
            data = await fetch("./map_standard.json").then((data) =>
                data.json()
            );
        }
        this.data.bricks = []
        data.forEach((e) =>
            this.data.bricks.push(new Brick(e.x, e.y, e.level, e.size))
        );
    },
    async init() {
        await this.initMap();
        this.data.paddle = new Paddle(
            this.data.width / 2,
            this.data.height - 20
        );
        this.addBall();
        canvas.width = this.data.width;
        canvas.height = this.data.height;
        function eventLoop() {
            root.drawBackground();
            root.ballMove();
            root.drawBrick();
            root.drawFood();
            root.data.paddle.draw();
            if (!root.isWin() && !root.isLost()) {
                requestAnimationFrame(eventLoop)
            }
        }
        requestAnimationFrame(eventLoop)
    },
    isWin() {
        if (root.data.bricks.filter((e) => e.level < 10).length === 0) {
            alert("you win");
            this.data.balls = [];
            this.data.foods = [];
            return true
        }
        return false
    },
    isLost() {
        if (this.data.balls.length === 0) {
            this.data.balls = [];
            this.data.foods = [];
            this.init();
            return true
        }
        return false
    },
    drawBackground() {
        ctx.beginPath();
        ctx.fillStyle = "#000";
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
    drawFood() {
        this.data.foods.forEach((food) => {
            food.move();
            food.draw();
        });
    },
    addBall() {
        this.data.balls.push(
            new Ball({
                x: this.data.paddle.x + this.data.paddle.width / 2,
                y: this.data.paddle.y,
                // x: this.data.paddle.x + this.data.paddle.width / 2,
                // y: 240,
                // direct: 0.73,
                // direct: 0.03,
                size: 5,
                speed: 3,
                direct: (Math.random() - 0.5) / 2 + 0.5,
            })
        );
    },
    multipleBall() {
        this.data.balls.forEach((ball) => ball.split());
    },
};

root.init();
