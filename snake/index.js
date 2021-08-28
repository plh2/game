class Snake {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

const root = {
  data: {
    ctx: document.querySelector("canvas"),
    snakes: [new Snake(50, 50), new Snake(60, 50), new Snake(70, 50)],
    snakePosition: {
      x: 70,
      y: 50,
    },
    foodPosition: {
      x: 70,
      y: 50,
    },
    direct: 2,
    speed: 50,
    width: 500,
    height: 300,
    elementMetric: 10,
  },
  init() {
    this.data.ctx.width = this.data.width;
    this.data.ctx.height = this.data.height;
    this.data.ctx = this.data.ctx.getContext("2d");
    this.eventListener();
    this.generateFood();
    this.timer = setInterval(() => {
      this.move();
      if (this.isLost()) return;
      this.data.snakes.push(
        new Snake(this.data.snakePosition.x, this.data.snakePosition.y)
      );
      if (
        this.data.snakePosition.x === this.data.foodPosition.x &&
        this.data.snakePosition.y === this.data.foodPosition.y
      ) {
        this.generateFood();
      } else {
        this.data.snakes.shift();
      }
      this.drawBackground();
      this.drawFood();
      this.drawSnake();
    }, this.data.speed);
  },
  isLost() {
    if (
      this.data.snakePosition.x < 0 ||
      this.data.snakePosition.y < 0 ||
      this.data.snakePosition.x > this.data.width ||
      this.data.snakePosition.y > this.data.height
    ) {
      alert("You Lost");
      clearInterval(this.timer);
      return true;
    }
    for (let i = 0; i < this.data.snakes.length - 1; i++) {
      const el = this.data.snakes[i];
      if (
        this.data.snakePosition.x === el.x &&
        this.data.snakePosition.y === el.y
      ) {
        alert("You Lost");
        clearInterval(this.timer);
        return true;
      }
    }
    return false;
  },
  eventListener() {
    document.addEventListener(
      "keydown",
      ($event) => {
        const code = $event.keyCode;
        if (
          code >= 37 &&
          code <= 40 &&
          Math.abs(this.data.direct - (code - 37)) !== 2
        ) {
          this.data.direct = code - 37;
        }
      },
      false
    );
  },
  move() {
    if (this.data.direct === 0) {
      this.data.snakePosition.x -= this.data.elementMetric;
    }
    if (this.data.direct === 1) {
      this.data.snakePosition.y -= this.data.elementMetric;
    }
    if (this.data.direct === 2) {
      this.data.snakePosition.x += this.data.elementMetric;
    }
    if (this.data.direct === 3) {
      this.data.snakePosition.y += this.data.elementMetric;
    }
  },
  drawBackground() {
    const ctx = this.data.ctx;
    ctx.beginPath();
    ctx.fillStyle = "lightyellow";
    ctx.fillRect(0, 0, 500, 500);
    ctx.stroke();
  },
  drawSnake() {
    const ctx = this.data.ctx;
    this.data.snakes.forEach((snake) => {
      ctx.beginPath();
      ctx.fillStyle = "red";
      ctx.fillRect(
        snake.x + 1,
        snake.y + 1,
        this.data.elementMetric - 1,
        this.data.elementMetric - 1
      );
      ctx.stroke();
    });
  },
  generateFood() {
    this.data.foodPosition.x =
      Math.round((Math.random() * this.data.width) / this.data.elementMetric) *
      this.data.elementMetric;
    this.data.foodPosition.y =
      Math.round((Math.random() * this.data.height) / this.data.elementMetric) *
      this.data.elementMetric;
  },
  drawFood() {
    const ctx = this.data.ctx;
    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.fillRect(
      this.data.foodPosition.x + 1,
      this.data.foodPosition.y + 1,
      this.data.elementMetric - 1,
      this.data.elementMetric - 1
    );
    ctx.stroke();
  },
};

root.init();
