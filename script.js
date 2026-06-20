const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const cellSize = 30;
const canvasSize = gridSize * cellSize;

canvas.width = canvasSize;
canvas.height = canvasSize;

let snakeBody = [{ x: 10, y: 10 }];
let prevSnakeBody = [{ x: 10, y: 10 }];
let direction = null;
let nextDirection = null;
let pellet = randomPos();
let scoreCount = 0;
let highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
let gameOver = false;
let gameStarted = false;

let lastTick = 0;
const TICK_MS = 120;
let skipPrevUpdate = false;

let deathAnimStart = null;
const DEATH_ANIM_MS = 600;

function loop(timestamp) {
    if (timestamp - lastTick >= TICK_MS) {
        lastTick = timestamp;
        tick();
    }
    const t = Math.min((timestamp - lastTick) / TICK_MS, 1);
    render(t, timestamp);
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function randomPos() {
    let pos;
    do {
        pos = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
        };
    } while (snakeBody.some(seg => seg.x === pos.x && seg.y === pos.y));
    return pos;
}

function drawCell(x, y, fillColor) {
    ctx.beginPath();
    ctx.fillStyle = fillColor;
    ctx.rect(x * cellSize, y * cellSize, cellSize, cellSize);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

function drawSegment(px, py, color, radius) {
    const pad = 2;
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.roundRect(px + pad, py + pad, cellSize - pad * 2, cellSize - pad * 2, radius);
    ctx.fill();
}

function drawEyes(px, py) {
    const eyeColor = 'rgb(190, 190, 70)';
    const r = 3;
    const positions = {
        right: [[px + cellSize - 8, py + 7],     [px + cellSize - 8, py + cellSize - 7]],
        left:  [[px + 8,            py + 7],     [px + 8,            py + cellSize - 7]],
        up:    [[px + 7,            py + 8],     [px + cellSize - 7, py + 8]],
        down:  [[px + 7,            py + cellSize - 8], [px + cellSize - 7, py + cellSize - 8]],
    };
    const eyes = positions[direction] || positions['right'];
    for (const [ex, ey] of eyes) {
        ctx.beginPath();
        ctx.fillStyle = eyeColor;
        ctx.arc(ex, ey, r, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawSnakeBodyInterpolated(t, deathFlash) {
    for (let i = snakeBody.length - 1; i >= 0; i--) {
        const seg = snakeBody[i];
        const prev = prevSnakeBody[i] || seg;
        const px = prev.x + (seg.x - prev.x) * t;
        const py = prev.y + (seg.y - prev.y) * t;

        let headColor = 'rgb(50, 42, 8)';
        let bodyColor = 'rgb(109, 96, 28)';
        if (deathFlash) {
            headColor = 'rgb(180, 40, 40)';
            bodyColor = 'rgb(160, 60, 60)';
        }

        if (i === 0) {
            drawSegment(px * cellSize, py * cellSize, headColor, 7);
            if (!deathFlash) drawEyes(px * cellSize, py * cellSize);
        } else {
            drawSegment(px * cellSize, py * cellSize, bodyColor, 5);
        }
    }
}

function resetGame() {
    snakeBody = [{ x: 10, y: 10 }];
    prevSnakeBody = [{ x: 10, y: 10 }];
    direction = null;
    nextDirection = null;
    if (scoreCount > highScore) {
        highScore = scoreCount;
        localStorage.setItem('snakeHighScore', highScore);
    }
    scoreCount = 0;
    gameOver = false;
    gameStarted = false;
    deathAnimStart = null;
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
        deathAnimStart = performance.now();
        return;
    }

    // Self collision
    for (const seg of snakeBody) {
        if (seg.x === newX && seg.y === newY) {
            gameOver = true;
            deathAnimStart = performance.now();
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

function tick() {
    if (!gameStarted || gameOver) return;
    if (!skipPrevUpdate) prevSnakeBody = snakeBody.map(s => ({ ...s }));
    skipPrevUpdate = false;
    moveSnake();
}

function render(t = 1, timestamp = 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    document.getElementById("score").innerHTML = `Score: ${scoreCount}   Best: ${highScore}`;

    const cx = pellet.x * cellSize + cellSize / 2;
    const cy = pellet.y * cellSize + cellSize / 2;
    ctx.beginPath();
    ctx.fillStyle = 'rgb(60, 50, 10)';
    ctx.arc(cx, cy, cellSize / 2 - 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.strokeStyle = 'rgb(60, 50, 10)';
    ctx.lineWidth = 2;
    ctx.moveTo(cx, cy - cellSize / 2 + 4);
    ctx.lineTo(cx + 4, cy - cellSize / 2);
    ctx.stroke();
    ctx.lineWidth = 1;

    const deathElapsed = deathAnimStart ? performance.now() - deathAnimStart : -1;
    const deathFlash = deathElapsed >= 0 && Math.floor(deathElapsed / 80) % 2 === 0;
    drawSnakeBodyInterpolated(t, deathFlash);

    if (!gameStarted) {
        drawOverlay('SNAKE', 'press arrow key');
        return;
    }

    if (gameOver) {
        if (deathElapsed < DEATH_ANIM_MS) return;
        drawOverlay('GAME OVER', 'press arrow key');
    }
}

function applyDirection(newDir) {
    if (gameOver && deathAnimStart && performance.now() - deathAnimStart < DEATH_ANIM_MS) return;
    if (gameOver || !gameStarted) {
        resetGame();
        gameStarted = true;
        direction = newDir;
        nextDirection = newDir;
        return;
    }
    const opposites = { up: 'down', down: 'up', left: 'right', right: 'left' };
    if (newDir !== opposites[direction]) {
        nextDirection = newDir;
        if (newDir !== direction) {
            const t = Math.min((performance.now() - lastTick) / TICK_MS, 1);
            prevSnakeBody = snakeBody.map((seg, i) => {
                const prev = prevSnakeBody[i] || seg;
                return {
                    x: prev.x + (seg.x - prev.x) * t,
                    y: prev.y + (seg.y - prev.y) * t,
                };
            });
            skipPrevUpdate = true;
            lastTick = performance.now() - TICK_MS;
        }
    }
}

document.addEventListener("keydown", (event) => {
    const keyMap = {
        ArrowUp: 'up', ArrowDown: 'down',
        ArrowLeft: 'left', ArrowRight: 'right'
    };
    const newDir = keyMap[event.key];
    if (!newDir) return;
    event.preventDefault();
    applyDirection(newDir);
});

let touchStart = null;

canvas.addEventListener("touchstart", (e) => {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    e.preventDefault();
}, { passive: false });

canvas.addEventListener("touchend", (e) => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    touchStart = null;

    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;

    let newDir;
    if (Math.abs(dx) > Math.abs(dy)) {
        newDir = dx > 0 ? 'right' : 'left';
    } else {
        newDir = dy > 0 ? 'down' : 'up';
    }
    applyDirection(newDir);
    e.preventDefault();
}, { passive: false });
