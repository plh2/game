const canvas = document.querySelector("canvas");
const storeBtn = document.querySelector("#store-btn");
const cleanBtn = document.querySelector("#clean-btn");
const ctx = canvas.getContext("2d");
let root;
const input = document.querySelector("input");

class Brick {
    constructor(x, y, l = 3) {
        this.x = x;
        this.y = y;
        this.level = l;
        this.size = 10;
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

root = {
    constants: {
        BRICKS_MAP: 'bricks_map'
    },
    data: {
        bricks: [],
        refreshSpeed: 1,
        width: 1100,
        height: 600,
        timer: null,
        rate: 1
    },
    async init() {
        this.data.rate = canvas.offsetWidth/this.data.width
        this.eventBind()
        canvas.width = this.data.width;
        canvas.height = this.data.height;
        this.data.timer = setInterval(() => {
            this.drawBackground();
            this.drawBrick();
        }, this.data.refreshSpeed);
    },
    drawBackground() {
        ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.data.width, this.data.height);
        ctx.stroke();
    },
    drawBrick() {
        this.data.bricks.forEach((brick) => brick.draw());
    },
    addBrick(e) {
        const level = document.querySelector("#brick-level").value
        const x = Math.floor((e.layerX / this.data.rate)/10)
        const y = Math.floor((e.layerY / this.data.rate)/10)
        if(!this[`${x}_${y}`]) {
            this[`${x}_${y}`] = true
            this.data.bricks.push(new Brick(x * 10, y * 10, Number(level)))
        }
    },
    eventBind() {
        let isMouseDown = false
        document.addEventListener("keydown", ($event) => {
            if ($event.metaKey && $event.code === 'KeyZ') {
                const brick = this.data.bricks.pop()
                const {x, y} = brick
                this[`${x/10}_${y/10}`] = false
            }
        })
        canvas.addEventListener('mousedown', ($event) => {
            isMouseDown = true
            this.addBrick($event)
        })
        canvas.addEventListener("mouseup", () => {
            isMouseDown = false
        })
        canvas.addEventListener("mousemove", ($event) => {
            if(isMouseDown) {
                this.addBrick($event)
            }
        })
        cleanBtn.addEventListener("click", () => {this.data.bricks = []})
        storeBtn.addEventListener("click", () => {
            console.log(this.data.bricks);
            localStorage.setItem(this.constants.BRICKS_MAP, JSON.stringify(this.data.bricks))
        })
    }
};

root.init();
