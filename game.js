// ==================== CANVAS SETUP ====================
// Haal het canvas element op uit de HTML
const canvas = document.getElementById('gameCanvas');
// Krijg de 2D tekening context van het canvas
const ctx = canvas.getContext('2d');

// Stel de canvas afmetingen in
canvas.width = 800;  // Breedte van het speelveld
canvas.height = 400; // Hoogte van het speelveld

// ==================== GAME STATUS ====================
// Variabele om bij te houden of de game actief is
let gameRunning = false;

// ==================== PADDLE EIGENSCHAPPEN ====================
// Breedte van elke paddle
const paddleWidth = 10;
// Hoogte van elke paddle
const paddleHeight = 80;
// Snelheid waarmee paddles bewegen
const paddleSpeed = 6;

// Speler 1 paddle (links)
const player1 = {
    x: 20,                          // X positie (van links)
    y: canvas.height / 2 - paddleHeight / 2, // Y positie (gecentreerd)
    width: paddleWidth,             // Breedte
    height: paddleHeight,           // Hoogte
    dy: 0,                          // Beweging in Y richting (delta y)
    color: '#00ff00'                // Groene kleur
};

// Speler 2 paddle (rechts)
const player2 = {
    x: canvas.width - paddleWidth - 20,  // X positie (van rechts)
    y: canvas.height / 2 - paddleHeight / 2, // Y positie (gecentreerd)
    width: paddleWidth,             // Breedte
    height: paddleHeight,           // Hoogte
    dy: 0,                          // Beweging in Y richting
    color: '#ff0000'                // Rode kleur
};

// ==================== BAL EIGENSCHAPPEN ====================
// Object voor de bal
const ball = {
    x: canvas.width / 2,   // Start positie X (midden)
    y: canvas.height / 2,  // Start positie Y (midden)
    radius: 8,             // Straal van de bal
    speed: 5,              // Begin snelheid
    dx: 5,                 // Beweging in X richting
    dy: 3,                 // Beweging in Y richting
    color: '#ffffff'       // Witte kleur
};

// ==================== SCORE SYSTEEM ====================
// Score voor beide spelers
let score1 = 0;  // Score speler 1
let score2 = 0;  // Score speler 2

// ==================== PARTIKELS ARRAY ====================
// Array om partikel effecten op te slaan
let particles = [];

// ==================== TOETSENBORD INPUT ====================
// Object om bij te houden welke toetsen ingedrukt zijn
const keys = {
    w: false,        // W toets voor speler 1 omhoog
    s: false,        // S toets voor speler 1 omlaag
    ArrowUp: false,  // Pijltje omhoog voor speler 2
    ArrowDown: false // Pijltje omlaag voor speler 2
};

// Event listener voor wanneer een toets wordt ingedrukt
document.addEventListener('keydown', function(e) {
    // Check welke toets is ingedrukt
    if (e.key === 'w' || e.key === 'W') {
        keys.w = true;  // Zet W toets status op true
    }
    if (e.key === 's' || e.key === 'S') {
        keys.s = true;  // Zet S toets status op true
    }
    if (e.key === 'ArrowUp') {
        keys.ArrowUp = true;  // Zet pijltje omhoog op true
        e.preventDefault();   // Voorkom standaard scroll gedrag
    }
    if (e.key === 'ArrowDown') {
        keys.ArrowDown = true;  // Zet pijltje omlaag op true
        e.preventDefault();     // Voorkom standaard scroll gedrag
    }
    // Spatie toets om game te starten/herstarten
    if (e.key === ' ') {
        if (!gameRunning) {
            startGame();  // Start de game
        }
        e.preventDefault();  // Voorkom scrollen
    }
});

// Event listener voor wanneer een toets wordt losgelaten
document.addEventListener('keyup', function(e) {
    // Check welke toets is losgelaten
    if (e.key === 'w' || e.key === 'W') {
        keys.w = false;  // Zet W toets status op false
    }
    if (e.key === 's' || e.key === 'S') {
        keys.s = false;  // Zet S toets status op false
    }
    if (e.key === 'ArrowUp') {
        keys.ArrowUp = false;  // Zet pijltje omhoog op false
    }
    if (e.key === 'ArrowDown') {
        keys.ArrowDown = false;  // Zet pijltje omlaag op false
    }
});

// ==================== PARTIKEL SYSTEEM ====================
// Functie om partikels te maken wanneer bal een paddle raakt
function createParticles(x, y, color) {
    // Maak 15 partikels
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: x,                           // X positie van partikel
            y: y,                           // Y positie van partikel
            dx: (Math.random() - 0.5) * 8,  // Random X snelheid (-4 tot 4)
            dy: (Math.random() - 0.5) * 8,  // Random Y snelheid (-4 tot 4)
            radius: Math.random() * 3 + 1,  // Random grootte (1-4)
            color: color,                   // Kleur van het partikel
            life: 1                         // Levensduur (1 = volledig zichtbaar)
        });
    }
}

// Functie om partikels te updaten en tekenen
function updateParticles() {
    // Loop door alle partikels achterwaarts (zodat we veilig kunnen verwijderen)
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];  // Haal het huidige partikel op
        
        // Update partikel positie
        p.x += p.dx;  // Beweeg in X richting
        p.y += p.dy;  // Beweeg in Y richting
        p.life -= 0.02;  // Verminder levensduur
        
        // Als partikel dood is, verwijder het
        if (p.life <= 0) {
            particles.splice(i, 1);  // Verwijder uit array
            continue;
        }
        
        // Teken het partikel
        ctx.save();  // Bewaar canvas status
        ctx.globalAlpha = p.life;  // Zet transparantie op basis van levensduur
        ctx.fillStyle = p.color;   // Zet kleur
        ctx.beginPath();           // Begin nieuw pad
        // Teken cirkel voor partikel
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();  // Vul de cirkel
        ctx.restore();  // Herstel canvas status
    }
}

// ==================== TEKEN FUNCTIES ====================
// Functie om een paddle te tekenen
function drawPaddle(paddle) {
    // Zet de vul kleur
    ctx.fillStyle = paddle.color;
    // Teken een rechthoek op de paddle positie
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // Voeg een glow effect toe aan de paddle
    ctx.shadowBlur = 15;  // Blur radius voor shadow
    ctx.shadowColor = paddle.color;  // Shadow kleur gelijk aan paddle kleur
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowBlur = 0;  // Reset shadow blur
}

// Functie om de bal te tekenen
function drawBall() {
    // Begin een nieuw pad
    ctx.beginPath();
    // Teken een cirkel voor de bal
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    // Zet de vul kleur
    ctx.fillStyle = ball.color;
    // Vul de cirkel
    ctx.fill();
    // Sluit het pad
    ctx.closePath();
    
    // Voeg glow effect toe aan de bal
    ctx.shadowBlur = 20;  // Blur radius
    ctx.shadowColor = ball.color;  // Shadow kleur
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;  // Reset shadow
}

// Functie om de middenlijn te tekenen
function drawMiddleLine() {
    // Zet lijn kleur
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    // Zet lijn breedte
    ctx.lineWidth = 4;
    // Begin nieuw pad
    ctx.beginPath();
    // Zet de lijn stijl naar gestippeld
    ctx.setLineDash([10, 10]);  // 10 pixels lijn, 10 pixels ruimte
    // Teken verticale lijn in het midden
    ctx.moveTo(canvas.width / 2, 0);  // Start bovenaan midden
    ctx.lineTo(canvas.width / 2, canvas.height);  // Eindig onderaan midden
    // Teken de lijn
    ctx.stroke();
    // Reset lijn stijl naar solid
    ctx.setLineDash([]);
}

// ==================== UPDATE FUNCTIES ====================
// Functie om paddle posities te updaten
function updatePaddles() {
    // Speler 1 beweging
    if (keys.w && player1.y > 0) {
        // Beweeg omhoog als W ingedrukt is en niet boven scherm
        player1.y -= paddleSpeed;
    }
    if (keys.s && player1.y < canvas.height - player1.height) {
        // Beweeg omlaag als S ingedrukt is en niet onder scherm
        player1.y += paddleSpeed;
    }
    
    // Speler 2 beweging
    if (keys.ArrowUp && player2.y > 0) {
        // Beweeg omhoog als pijltje omhoog ingedrukt is en niet boven scherm
        player2.y -= paddleSpeed;
    }
    if (keys.ArrowDown && player2.y < canvas.height - player2.height) {
        // Beweeg omlaag als pijltje omlaag ingedrukt is en niet onder scherm
        player2.y += paddleSpeed;
    }
}

// Functie om bal positie en botsingen te updaten
function updateBall() {
    // Beweeg de bal
    ball.x += ball.dx;  // Update X positie
    ball.y += ball.dy;  // Update Y positie
    
    // Botsing met boven en onder muur
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;  // Keer Y richting om
        // Verander bal kleur bij muur botsing
        ball.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
    }
    
    // Check botsing met speler 1 paddle (links)
    if (ball.x - ball.radius < player1.x + player1.width &&
        ball.x + ball.radius > player1.x &&
        ball.y + ball.radius > player1.y &&
        ball.y - ball.radius < player1.y + player1.height) {
        
        // Bal raakt speler 1 paddle
        ball.dx = Math.abs(ball.dx);  // Zorg dat bal naar rechts gaat
        ball.dx *= 1.05;  // Verhoog snelheid met 5%
        ball.dy *= 1.05;  // Verhoog snelheid met 5%
        
        // Voeg spin toe gebaseerd op waar bal paddle raakt
        let hitPos = (ball.y - player1.y) / player1.height - 0.5;
        ball.dy = hitPos * 10;  // Pas Y richting aan (-5 tot 5)
        
        // Maak partikels bij botsing
        createParticles(ball.x, ball.y, player1.color);
        
        // Verander bal kleur
        ball.color = player1.color;
    }
    
    // Check botsing met speler 2 paddle (rechts)
    if (ball.x + ball.radius > player2.x &&
        ball.x - ball.radius < player2.x + player2.width &&
        ball.y + ball.radius > player2.y &&
        ball.y - ball.radius < player2.y + player2.height) {
        
        // Bal raakt speler 2 paddle
        ball.dx = -Math.abs(ball.dx);  // Zorg dat bal naar links gaat
        ball.dx *= 1.05;  // Verhoog snelheid met 5%
        ball.dy *= 1.05;  // Verhoog snelheid met 5%
        
        // Voeg spin toe gebaseerd op waar bal paddle raakt
        let hitPos = (ball.y - player2.y) / player2.height - 0.5;
        ball.dy = hitPos * 10;  // Pas Y richting aan (-5 tot 5)
        
        // Maak partikels bij botsing
        createParticles(ball.x, ball.y, player2.color);
        
        // Verander bal kleur
        ball.color = player2.color;
    }
    
    // Check of bal buiten het veld is (score punt)
    if (ball.x - ball.radius < 0) {
        // Speler 2 scoort (bal ging links uit)
        score2++;
        updateScoreDisplay();  // Update score op scherm
        resetBall();  // Reset bal naar midden
    } else if (ball.x + ball.radius > canvas.width) {
        // Speler 1 scoort (bal ging rechts uit)
        score1++;
        updateScoreDisplay();  // Update score op scherm
        resetBall();  // Reset bal naar midden
    }
}

// ==================== RESET FUNCTIES ====================
// Functie om de bal te resetten naar het midden
function resetBall() {
    // Zet bal terug naar midden
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    // Reset snelheid
    ball.speed = 5;
    // Random richting (links of rechts)
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    // Random Y richting
    ball.dy = (Math.random() - 0.5) * 4;
    // Reset kleur naar wit
    ball.color = '#ffffff';
}

// ==================== SCORE WEERGAVE ====================
// Functie om score op scherm te updaten
function updateScoreDisplay() {
    // Haal score elementen op uit HTML
    document.getElementById('player1-score').textContent = score1;
    document.getElementById('player2-score').textContent = score2;
}

// ==================== GAME MESSAGE ====================
// Functie om een bericht te tonen
function showMessage(text) {
    // Haal message element op
    const message = document.getElementById('game-message');
    // Zet de tekst
    message.textContent = text;
    // Maak zichtbaar
    message.style.display = 'block';
}

// Functie om bericht te verbergen
function hideMessage() {
    // Haal message element op
    const message = document.getElementById('game-message');
    // Verberg het
    message.style.display = 'none';
}

// ==================== GAME LOOP ====================
// Hoofd game loop die constant wordt aangeroepen
function gameLoop() {
    // Check of game actief is
    if (!gameRunning) {
        return;  // Stop de loop als game niet actief is
    }
    
    // Wis het hele canvas (maak zwart)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Teken middenlijn
    drawMiddleLine();
    
    // Update en teken partikels
    updateParticles();
    
    // Update paddle posities
    updatePaddles();
    
    // Update bal positie en check botsingen
    updateBall();
    
    // Teken beide paddles
    drawPaddle(player1);
    drawPaddle(player2);
    
    // Teken de bal
    drawBall();
    
    // Vraag om volgende frame (60 FPS)
    requestAnimationFrame(gameLoop);
}

// ==================== START GAME ====================
// Functie om de game te starten
function startGame() {
    // Zet game status op actief
    gameRunning = true;
    // Verberg het start bericht
    hideMessage();
    // Reset scores naar 0
    score1 = 0;
    score2 = 0;
    // Update score weergave
    updateScoreDisplay();
    // Reset bal positie
    resetBall();
    // Clear alle partikels
    particles = [];
    // Start de game loop
    gameLoop();
}

// ==================== INITIALISATIE ====================
// Toon start bericht wanneer pagina laadt
showMessage('Druk op SPATIE om te starten!');
// Update score weergave bij start
updateScoreDisplay();
