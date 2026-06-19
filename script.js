const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const cellSize = 30;
const canvasSize = gridSize * cellSize;

canvas.width = canvasSize;
canvas.height = canvasSize;

let snakeBody = [{ x: 10, y: 10 }];
let direction = null;
let nextDirection = null;
let pellet = randomPos();
let scoreCount = 0;
let gameOver = false;
let gameStarted = false;

setInterval(render, 120);

function randomPos() {
    return {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
    };
}

function drawCell(x, y, fillColor) {
    ctx.beginPath();
    ctx.fillStyle = fillColor;
    ctx.rect(x * cellSize, y * cellSize, cellSize, cellSize);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

function drawSnakeBody() {
    for (const seg of snakeBody) {
        drawCell(seg.x, seg.y, "rgb(109, 96, 28)");
    }
}

function resetGame() {
    snakeBody = [{ x: 10, y: 10 }];
    direction = null;
    nextDirection = null;
    scoreCount = 0;
    gameOver = false;
    gameStarted = false;
    pellet = randomPos();
}

function moveSnake() {
    if (!direction) return;

    // Commit queued direction
    direction = nextDirection;

    const head = snakeBody[0];
    let newX = head.x;
    let newY = head.y;

    if (direction === 'up')    newY--;
    if (direction === 'down')  newY++;
    if (direction === 'left')  newX--;
    if (direction === 'right') newX++;

    // Boundary collision
    if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) {
        gameOver = true;
        return;
    }

    // Self collision
    for (const seg of snakeBody) {
        if (seg.x === newX && seg.y === newY) {
            gameOver = true;
            return;
        }
    }

    // Move
    snakeBody.unshift({ x: newX, y: newY });

    // Eat pellet or remove tail
    if (newX === pellet.x && newY === pellet.y) {
        scoreCount++;
        pellet = randomPos();
    } else {
        snakeBody.pop();
    }
}

function drawOverlay(title, sub) {
    ctx.fillStyle = "rgba(200, 200, 80)";
    ctx.beginPath();
    ctx.rect(canvas.width / 2 - 150, canvas.height / 2 - 50, 300, 100);
    ctx.fill();

    ctx.font = '24px NokiaKokia';
    ctx.fillStyle = 'rgba(109,96,28)';
    const tw = ctx.measureText(title).width;
    ctx.fillText(title, canvas.width / 2 - tw / 2, canvas.height / 2);

    ctx.font = '14px NokiaKokia';
    const sw = ctx.measureText(sub).width;
    ctx.fillText(sub, canvas.width / 2 - sw / 2, canvas.height / 2 + 24);
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    document.getElementById("score").innerHTML = `Score: ${scoreCount}`;

    drawCell(pellet.x, pellet.y, "rgb(109, 96, 28)");
    drawSnakeBody();

    if (!gameStarted) {
        drawOverlay('SNAKE', 'press arrow key');
        return;
    }

    if (gameOver) {
        drawOverlay('GAME OVER', 'press arrow key');
        return;
    }

    moveSnake();
}

document.addEventListener("keydown", (event) => {
    const keyMap = {
        ArrowUp: 'up', ArrowDown: 'down',
        ArrowLeft: 'left', ArrowRight: 'right'
    };
    const newDir = keyMap[event.key];
    if (!newDir) return;

    // If game over or not started, restart
    if (gameOver || !gameStarted) {
        resetGame();
        gameStarted = true;
        direction = newDir;
        nextDirection = newDir;
        return;
    }

    // Prevent reversing
    const opposites = { up: 'down', down: 'up', left: 'right', right: 'left' };
    if (newDir !== opposites[direction]) {
        nextDirection = newDir;
    }
});
