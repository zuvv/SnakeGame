const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 50; // Adjust this value to change the size of the grid
const cellSize = 10; // Adjust this value to change the size of each cell
const canvasSize = gridSize * cellSize;
const interval = setInterval(render, 50);

let pellet = createFood();
let frame = 0;
let gameState = true;
let myDirection = "";
var scoreCount = 0;

//Initial snake body size
let snakeBody = [
    { x: 25, y: 25 },
    { x: 25, y: 24 },
    { x: 25, y: 23 },
    { x: 25, y: 22 }
];

canvas.width = canvasSize;
canvas.height = canvasSize;

// Function to draw a single cell
function drawCell(x, y, fillColor) {
    ctx.beginPath();
    ctx.fillStyle = fillColor; // Set the fill color
    ctx.rect(x * cellSize, y * cellSize, cellSize, cellSize);
    ctx.fill()
    /*
    ctx.strokeStyle = '#000';
    ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
    */
}

//Drawing the snake
function drawSnakeBody() {
    for (let i = 0; i < snakeBody.length; i++) {
        drawCell(snakeBody[i].x, snakeBody[i].y, "rgb(109, 96, 28)");
    }
}


//swap tail to new location
//TODO: Add intercept function into here
function tailSwap(x, y) {
    gameState = true;
    //update tail values to new location values
    snakeBody[snakeBody.length - 1].x = x;
    snakeBody[snakeBody.length - 1].y = y;

    // Create a new tail object with the old tail's values
    const newTail = { x: snakeBody[snakeBody.length - 1].x, y: snakeBody[snakeBody.length - 1].y };

    //update tail to head
    //TODO: Use a linked list here(Need to create for javascripts) for O(1)
    snakeBody.splice(0, 0, newTail);

    //draw new head
    drawCell(snakeBody[0].x, snakeBody[0].y);

    //Grow snake - refactor
    if (pellet.x === x && pellet.y === y) {
        pellet = createFood();
    } else {
        snakeBody.pop();
    }

    //Outside boundaries
    if (x >= (canvas.width / cellSize) || x < 0 || y >= (canvas.height / cellSize) || y < 0) {
        //reset
        snakeBody = [
            { x: 25, y: 25 },
            { x: 25, y: 24 },
            { x: 25, y: 23 },
            { x: 25, y: 22 }
        ];
        myDirection = ""
        gameState = false;
        scoreCount = 0;
    }
}

// Function to be executed when a key is pressed
function handleKeyDown(event) {

    if (event.key === 'ArrowUp') {
        myDirection = event.key;
        tailSwap(snakeBody[0].x, (snakeBody[0].y) - 1);
    }
    if (event.key === 'ArrowDown') {
        myDirection = event.key;
        tailSwap(snakeBody[0].x, (snakeBody[0].y) + 1);
    }
    if (event.key === 'ArrowLeft') {
        myDirection = event.key;
        tailSwap((snakeBody[0].x) - 1, snakeBody[0].y);
    }
    if (event.key === 'ArrowRight') {
        myDirection = event.key;
        tailSwap((snakeBody[0].x) + 1, snakeBody[0].y);
    }
}

function createFood() {
    //select a random location within the grid
    //color a box within this grid
    const randomX = Math.floor(Math.random() * gridSize);
    const randomY = Math.floor(Math.random() * gridSize);

     scoreCount++;
    return { x: randomX, y: randomY };
}



function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //Score function
    document.getElementById("score").innerHTML = "Pellets Consumed: "+`${scoreCount}`;
    //food pellet
    drawCell(pellet.x, pellet.y, "rgb(109, 96, 28)");
    drawSnakeBody();
    handleKeyDown({ key: myDirection });

    if (gameState === false) {
        //You lost information
        ctx.fillStyle = "rgba(200, 200, 80)"; // Set the fill color
        ctx.rect(canvas.width / 2 - 150, canvas.height / 2 - 50, 300, 100);
        ctx.fill()

        const text = 'GAME OVER';
        ctx.font = '24px NokiaKokia';
        ctx.fillStyle = 'rgba(109,96,28)';
        const text_width = ctx.measureText(text);
        ctx.fillText(text, canvas.width / 2 - (text_width.width / 2), canvas.height / 2)

        const text_sub = 'press arrow key';
        ctx.font = '14px NokiaKokia';
        ctx.fillStyle = 'rgba(109,96,28)';
        const text_sub_width = ctx.measureText(text_sub);
        ctx.fillText(text_sub, canvas.width / 2 - (text_sub_width.width / 2), canvas.height / 2 + 24);


    }
}

// Adding event listener for keydown to the document
document.addEventListener("keydown", handleKeyDown);




//const interval = setInterval(numberUpdate, 100);
//drawGrid();



/*
// Function to draw the entire grid
function drawGrid() {
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            drawCell(x, y);
        }
    }
}

function create2DArray(rows, cols) {
    let arr = new Array(rows);
    for (let i = 0; i < rows; i++) {
        arr[i] = new Array(cols).fill(0);
    }
    return arr;
}

const rows = 50;
const cols = 50;
const myArray = create2DArray(rows, cols);
*/