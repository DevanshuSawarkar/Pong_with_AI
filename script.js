const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Constants
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 16;
const PLAYER_X = 20;
const AI_X = canvas.width - PADDLE_WIDTH - 20;
const PADDLE_SPEED = 6;
const BALL_SPEED = 6;

// Score
let playerScore = 0;
let aiScore = 0;

// State
let playerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let aiY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let ballX = canvas.width / 2 - BALL_SIZE / 2;
let ballY = canvas.height / 2 - BALL_SIZE / 2;
let ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
let ballVelY = BALL_SPEED * (Math.random() * 2 - 1);

// Track mouse for paddle
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  playerY = mouseY - PADDLE_HEIGHT / 2;

  // Clamp paddle within canvas
  if (playerY < 0) playerY = 0;
  if (playerY + PADDLE_HEIGHT > canvas.height) playerY = canvas.height - PADDLE_HEIGHT;
});

// Helper functions
function drawRect(x, y, w, h, color = '#fff') {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawBall(x, y, size, color = '#fff') {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
  ctx.fill();
}

function drawScore() {
  ctx.font = "bold 40px Arial";
  ctx.fillStyle = "#0ff";
  ctx.textAlign = "left";
  ctx.fillText(playerScore, canvas.width/4, 50);

  ctx.fillStyle = "#f0f";
  ctx.textAlign = "right";
  ctx.fillText(aiScore, 3*canvas.width/4, 50);
}

function resetBall(direction = 1) {
  ballX = canvas.width / 2 - BALL_SIZE / 2;
  ballY = canvas.height / 2 - BALL_SIZE / 2;
  // Serve towards the player who just lost the point
  ballVelX = BALL_SPEED * direction;
  ballVelY = BALL_SPEED * (Math.random() * 2 - 1);
}

// Simple AI for right paddle
function aiMove() {
  const aiCenter = aiY + PADDLE_HEIGHT/2;
  if (aiCenter < ballY + BALL_SIZE/2 - 10) {
    aiY += PADDLE_SPEED;
  } else if (aiCenter > ballY + BALL_SIZE/2 + 10) {
    aiY -= PADDLE_SPEED;
  }
  // Clamp
  if (aiY < 0) aiY = 0;
  if (aiY + PADDLE_HEIGHT > canvas.height) aiY = canvas.height - PADDLE_HEIGHT;
}

// Collision detection
function collide(px, py, pw, ph, bx, by, bs) {
  return (
    bx < px + pw &&
    bx + bs > px &&
    by < py + ph &&
    by + bs > py
  );
}

// Main game loop
function update() {
  // Move ball
  ballX += ballVelX;
  ballY += ballVelY;

  // Wall collision (top/bottom)
  if (ballY <= 0 || ballY + BALL_SIZE >= canvas.height) {
    ballVelY *= -1;
    // Clamp in bounds
    if (ballY < 0) ballY = 0;
    if (ballY + BALL_SIZE > canvas.height) ballY = canvas.height - BALL_SIZE;
  }

  // Paddle collision
  // Player
  if (collide(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, ballX, ballY, BALL_SIZE)) {
    ballVelX = Math.abs(ballVelX);
    // Add some spin
    let impact = (ballY + BALL_SIZE/2) - (playerY + PADDLE_HEIGHT/2);
    ballVelY = impact * 0.25;
  }
  // AI
  if (collide(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, ballX, ballY, BALL_SIZE)) {
    ballVelX = -Math.abs(ballVelX);
    let impact = (ballY + BALL_SIZE/2) - (aiY + PADDLE_HEIGHT/2);
    ballVelY = impact * 0.25;
  }

  // Score system
  if (ballX < 0) {
    // AI scores
    aiScore++;
    resetBall(1); // Serve to right
  } else if (ballX + BALL_SIZE > canvas.width) {
    // Player scores
    playerScore++;
    resetBall(-1); // Serve to left
  }

  // Move AI paddle
  aiMove();
}

function draw() {
  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Middle line
  for (let i = 0; i < canvas.height; i += 30) {
    drawRect(canvas.width / 2 - 2, i, 4, 18, "#444");
  }
  // Player paddle
  drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, "#0ff");
  // AI paddle
  drawRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, "#f0f");
  // Ball
  drawBall(ballX, ballY, BALL_SIZE, "#fff");
  // Score
  drawScore();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

resetBall();
gameLoop();