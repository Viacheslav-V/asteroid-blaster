const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let spaceship = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  angle: 0, // Radians
  speed: 0,
  thrust: 0.05,
  rotationSpeed: 0.05,
  size: 20, //Approximate "radius" for collision detection
};

let asteroids = [];
const asteroidCount = 5; // Initial number of asteroids
let asteroidSpeed = 1;
let laserShots = [];
let score = 0;

// Function to create asteroids
function createAsteroid() {
    const size = Math.floor(Math.random() * 30) + 20; // Asteroid size
    const x = Math.random() < 0.5 ? 0 - size : canvas.width + size; // Start off-screen
    const y = Math.random() * canvas.height;
    const angle = Math.random() * Math.PI * 2; // Random direction
    asteroids.push({ x, y, angle, size, speed: asteroidSpeed});
}

// Initial asteroid creation
for (let i = 0; i < asteroidCount; i++) {
    createAsteroid();
}

// Key press handling
const keys = {};
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});
document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// Game loop
function gameLoop() {
  // 1. Update game state
  update();

  // 2. Draw the scene
  draw();

  // 3. Request the next frame
  requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    // Spaceship movement
    if (keys['ArrowUp']) {
        spaceship.speed += spaceship.thrust;
    } else {
        spaceship.speed *= 0.98; // Gradual deceleration
    }

    if (keys['ArrowLeft']) {
        spaceship.angle -= spaceship.rotationSpeed;
    }
    if (keys['ArrowRight']) {
        spaceship.angle += spaceship.rotationSpeed;
    }

    spaceship.x += spaceship.speed * Math.cos(spaceship.angle);
    spaceship.y += spaceship.speed * Math.sin(spaceship.angle);

    // Screen wrapping for spaceship
    if (spaceship.x < 0 - spaceship.size) spaceship.x = canvas.width + spaceship.size;
    if (spaceship.x > canvas.width + spaceship.size) spaceship.x = 0 - spaceship.size;
    if (spaceship.y < 0 - spaceship.size) spaceship.y = canvas.height + spaceship.size;
    if (spaceship.y > canvas.height + spaceship.size) spaceship.y = 0 - spaceship.size;

    //Asteroid Movement
    asteroids.forEach(asteroid => {
        asteroid.x += asteroid.speed * Math.cos(asteroid.angle);
        asteroid.y += asteroid.speed * Math.sin(asteroid.angle);

        // Screen wrapping for asteroids
        if (asteroid.x < 0 - asteroid.size) asteroid.x = canvas.width + asteroid.size;
        if (asteroid.x > canvas.width + asteroid.size) asteroid.x = 0 - asteroid.size;
        if (asteroid.y < 0 - asteroid.size) asteroid.y = canvas.height + asteroid.size;
        if (asteroid.y > canvas.height + asteroid.size) asteroid.y = 0 - asteroid.size;
    });


    // Laser movement and collision detection
    for (let i = laserShots.length - 1; i >= 0; i--) {
        laserShots[i].x += laserShots[i].speed * Math.cos(laserShots[i].angle);
        laserShots[i].y += laserShots[i].speed * Math.sin(laserShots[i].angle);
        laserShots[i].life--;

        if (laserShots[i].x < 0 || laserShots[i].x > canvas.width || laserShots[i].y < 0 || laserShots[i].y > canvas.height || laserShots[i].life <= 0) {
            laserShots.splice(i, 1); // Remove laser if out of bounds or life is 0
            continue; // Skip collision check
        }

        // Asteroid collision detection (loop backwards for splicing)
        for (let j = asteroids.length - 1; j >= 0; j--) {
            const dx = laserShots[i].x - asteroids[j].x;
            const dy = laserShots[i].y - asteroids[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < asteroids[j].size) {
                // Collision detected!
                asteroids.splice(j, 1); // Remove the asteroid
                laserShots.splice(i, 1); // Remove the laser
                score++; // Increase score
                createAsteroid(); // Create a new asteroid

                break; // Important: Break inner loop since laser hit an asteroid
            }
        }
    }


    // Spaceship-Asteroid Collision Detection
    for (let i = 0; i < asteroids.length; i++) {
        const dx = spaceship.x - asteroids[i].x;
        const dy = spaceship.y - asteroids[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < spaceship.size + asteroids[i].size) {
            // Collision detected! Game Over
            alert("Game Over! Score: " + score);
            document.location.reload(); // Restart the game
        }
    }
}

// Draw everything
function draw() {
    // Clear the canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw spaceship
    ctx.save(); // Save the current drawing state
    ctx.translate(spaceship.x, spaceship.y); // Move the origin to the spaceship's position
    ctx.rotate(spaceship.angle); // Rotate around the spaceship's center

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(spaceship.size, 0);
    ctx.lineTo(-spaceship.size, -spaceship.size / 2);
    ctx.lineTo(-spaceship.size, spaceship.size / 2);
    ctx.closePath();
    ctx.stroke();

    ctx.restore(); // Restore the drawing state

    // Draw Asteroids
    asteroids.forEach(asteroid => {
        ctx.fillStyle = 'gray';
        ctx.beginPath();
        ctx.arc(asteroid.x, asteroid.y, asteroid.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    });

    // Draw Lasers
    laserShots.forEach(laser => {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(laser.x, laser.y, 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    });

    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = '16px sans-serif';
    ctx.fillText('Score: ' + score, 10, 20);
}


// Event listener for shooting lasers
document.addEventListener('keydown', (e) => {
    if (e.key === ' ') { // Spacebar
        shootLaser();
    }
});

function shootLaser() {
    laserShots.push({
        x: spaceship.x + spaceship.size * Math.cos(spaceship.angle),
        y: spaceship.y + spaceship.size * Math.sin(spaceship.angle),
        angle: spaceship.angle,
        speed: 5,
        life: 100 // Frames before laser disappears
    });
}

// Start the game loop
gameLoop();