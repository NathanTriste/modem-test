// ==========================================
// 🚀 NAVE ESCAPE - v1.0.0.5
// ==========================================


// ==========================================
// CANVAS
// ==========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


// ==========================================
// TELAS
// ==========================================

const menu = document.getElementById("menu");
const game = document.getElementById("game");
const gameOver = document.getElementById("gameOver");


// ==========================================
// BOTÕES
// ==========================================

const playBtn =
    document.getElementById("startButton");

const restartBtn =
    document.getElementById("restartButton");

const menuBtn =
    document.getElementById("menuButton");


// ==========================================
// HUD
// ==========================================

const scoreText =
    document.getElementById("score");

const livesText =
    document.getElementById("lives");

const highScoreText =
    document.getElementById("highScore");

const finalScoreText =
    document.getElementById("finalScore");


// ==========================================
// 🎵 MÚSICA
// ==========================================

const musica =
    new Audio("music/NoSurprises.mp3");

musica.loop = true;
musica.volume = 0.2;


// Som do tiro
const somTiro = new Audio("music/laser.mp3");
somTiro.volume = 0.4;

// ==========================================
// TAMANHO DO CANVAS
// ==========================================

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener(
    "resize",
    resizeCanvas
);


// ==========================================
// 🚀 JOGADOR
// ==========================================

const player = {

    x: 0,
    y: 0,

    width: 45,
    height: 55,

    speed: 7,
    maxSpeed: 16
};


// ==========================================
// ARRAYS
// ==========================================

let meteors = [];
let bullets = [];
let particles = [];
let stars = [];


// ==========================================
// VARIÁVEIS
// ==========================================

let score = 0;
let lives = 3;

let highScore =
    Number(
        localStorage.getItem(
            "naveEscapeHighScore"
        )
    ) || 0;

let difficulty = 1;

let gameTime = 0;

let meteorTimer = 0;

let shootCooldown = 0;

let gameRunning = false;

let animationId;


// ==========================================
// ⭐ ESTRELAS
// ==========================================

function createStars() {

    stars = [];

    for (
        let i = 0;
        i < 150;
        i++
    ) {

        stars.push({

            x:
                Math.random() *
                canvas.width,

            y:
                Math.random() *
                canvas.height,

            size:
                Math.random() * 2 + 0.5,

            speed:
                Math.random() * 2 + 0.5
        });
    }
}


// ==========================================
// 🚀 RESET PLAYER
// ==========================================

function resetPlayer() {

    player.x =
        canvas.width / 2 -
        player.width / 2;

    player.y =
        canvas.height - 100;

    player.speed = 7;
}


// ==========================================
// ☄️ CRIAR METEORO
// ==========================================

function createMeteor() {

    const size =
        Math.random() * 40 + 25;

    // Meteoros com 45+ são grandes

    const isBig =
        size >= 45;

    meteors.push({

        x:
            Math.random() *
            (canvas.width - size),

        y: -size,

        width: size,
        height: size,

        speed:
            Math.random() * 2 +
            2 +
            difficulty * 0.45,

        rotation:
            Math.random() *
            Math.PI * 2,

        rotationSpeed:
            (Math.random() - 0.5) * 0.05,

        // ⭐ VIDA DO METEORO
        health: isBig ? 2 : 1,

        isBig: isBig
    });
}


// ==========================================
// 💥 EXPLOSÃO
// ==========================================

function createExplosion(x, y) {

    for (
        let i = 0;
        i < 15;
        i++
    ) {

        particles.push({

            x: x,
            y: y,

            speedX:
                (Math.random() - 0.5) * 8,

            speedY:
                (Math.random() - 0.5) * 8,

            size:
                Math.random() * 4 + 2,

            life: 30
        });
    }
}


// ==========================================
// 🔫 TIRO
// ==========================================

function shoot() {

    if (!gameRunning)
        return;

    if (shootCooldown > 0)
        return;

    bullets.push({

        x:
            player.x +
            player.width / 2 -
            3,

        y:
            player.y,

        width: 6,
        height: 18,

        speed: 12
    });

    shootCooldown = 10;
}


// ==========================================
// 🌌 FUNDO
// ==========================================

function drawBackground() {

    ctx.fillStyle = "#02040a";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    for (
        const star of stars
    ) {

        ctx.fillStyle = "#ffffff";

        ctx.globalAlpha =
            Math.random() * 0.7 + 0.3;

        ctx.fillRect(
            star.x,
            star.y,
            star.size,
            star.size
        );

        star.y += star.speed;

        if (
            star.y >
            canvas.height
        ) {

            star.y = -5;

            star.x =
                Math.random() *
                canvas.width;
        }
    }

    ctx.globalAlpha = 1;
}


// ==========================================
// 🚀 DESENHAR NAVE
// ==========================================

function drawPlayer() {

    ctx.save();

    ctx.translate(

        player.x +
        player.width / 2,

        player.y +
        player.height / 2
    );


    // Fogo

    ctx.fillStyle = "#ff8c00";

    ctx.beginPath();

    ctx.moveTo(-10, 20);
    ctx.lineTo(0, 35);
    ctx.lineTo(10, 20);

    ctx.fill();


    // Corpo

    ctx.fillStyle = "#00eaff";

    ctx.beginPath();

    ctx.moveTo(0, -28);

    ctx.lineTo(-22, 25);

    ctx.lineTo(0, 17);

    ctx.lineTo(22, 25);

    ctx.closePath();

    ctx.fill();


    // Cabine

    ctx.fillStyle = "#ffffff";

    ctx.beginPath();

    ctx.arc(
        0,
        -8,
        7,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
}


// ==========================================
// ☄️ DESENHAR METEORO
// ==========================================

function drawMeteor(meteor) {

    ctx.save();

    ctx.translate(

        meteor.x +
        meteor.width / 2,

        meteor.y +
        meteor.height / 2
    );

    ctx.rotate(
        meteor.rotation
    );


    // Meteoros grandes ficam
    // visualmente diferentes

    if (meteor.isBig) {

        ctx.fillStyle = "#9b4d32";

    } else {

        ctx.fillStyle = "#777";
    }


    ctx.beginPath();

    const radius =
        meteor.width / 2;

    for (
        let i = 0;
        i < 8;
        i++
    ) {

        const angle =
            (Math.PI * 2 / 8) * i;

        const randomRadius =
            radius *
            (
                0.75 +
                Math.random() * 0.25
            );

        const x =
            Math.cos(angle) *
            randomRadius;

        const y =
            Math.sin(angle) *
            randomRadius;

        if (i === 0) {

            ctx.moveTo(x, y);

        } else {

            ctx.lineTo(x, y);
        }
    }

    ctx.closePath();

    ctx.fill();


    // Cratera

    ctx.fillStyle =
        meteor.isBig
            ? "#54291f"
            : "#444";

    ctx.beginPath();

    ctx.arc(

        -radius * 0.2,

        -radius * 0.1,

        radius * 0.2,

        0,

        Math.PI * 2
    );

    ctx.fill();


    // Vida do meteoro grande

    if (meteor.isBig) {

        ctx.fillStyle =
            "#ffffff";

        ctx.font =
            "bold 14px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            meteor.health,
            0,
            5
        );
    }

    ctx.restore();
}


// ==========================================
// 🔥 DESENHAR TIRO
// ==========================================

function drawBullet(bullet) {

    ctx.save();

    ctx.fillStyle =
        "#00ffff";

    ctx.shadowColor =
        "#00ffff";

    ctx.shadowBlur = 15;

    ctx.fillRect(

        bullet.x,
        bullet.y,

        bullet.width,
        bullet.height
    );

    ctx.restore();
}


// ==========================================
// 🚀 MOVIMENTO
// ==========================================

function movePlayer() {

    if (
        keys["ArrowLeft"] ||
        keys["a"] ||
        keys["A"]
    ) {

        player.x -=
            player.speed;
    }

    if (
        keys["ArrowRight"] ||
        keys["d"] ||
        keys["D"]
    ) {

        player.x +=
            player.speed;
    }


    // Limite esquerdo

    if (
        player.x < 0
    ) {

        player.x = 0;
    }


    // Limite direito

    if (
        player.x +
        player.width >
        canvas.width
    ) {

        player.x =
            canvas.width -
            player.width;
    }
}


// ==========================================
// ☄️ ATUALIZAR METEOROS
// ==========================================

function updateMeteors() {

    meteorTimer++;


    // Meteoros aparecem cada vez mais rápido

    const spawnRate =
        Math.max(
            5,
            45 -
            difficulty * 4
        );


    if (
        meteorTimer >=
        spawnRate
    ) {

        meteorTimer = 0;


        // Quantidade aumenta
        // conforme dificuldade

        const amount =
            Math.min(

                1 +
                Math.floor(
                    difficulty / 3
                ),

                7
            );


        for (
            let i = 0;
            i < amount;
            i++
        ) {

            createMeteor();
        }
    }


    // Movimento dos meteoros

    for (
        let i =
            meteors.length - 1;

        i >= 0;

        i--
    ) {

        const meteor =
            meteors[i];


        meteor.y +=
            meteor.speed;

        meteor.rotation +=
            meteor.rotationSpeed;


        // Saiu da tela

        if (
            meteor.y >
            canvas.height +
            meteor.height
        ) {

            meteors.splice(
                i,
                1
            );

            continue;
        }


        // Colisão com a nave

        if (

            player.x <
                meteor.x +
                meteor.width &&

            player.x +
                player.width >
                meteor.x &&

            player.y <
                meteor.y +
                meteor.height &&

            player.y +
                player.height >
                meteor.y

        ) {

            createExplosion(

                meteor.x +
                meteor.width / 2,

                meteor.y +
                meteor.height / 2
            );


            meteors.splice(
                i,
                1
            );


            lives--;

            updateHUD();


            if (
                lives <= 0
            ) {

                endGame();

                return;
            }
        }
    }
}


// ==========================================
// 🔫 ATUALIZAR TIROS
// ==========================================

function updateBullets() {

    if (
        shootCooldown > 0
    ) {

        shootCooldown--;
    }


    for (
        let i =
            bullets.length - 1;

        i >= 0;

        i--
    ) {

        const bullet =
            bullets[i];


        bullet.y -=
            bullet.speed;


        // Saiu da tela

        if (
            bullet.y < -30
        ) {

            bullets.splice(
                i,
                1
            );

            continue;
        }


        // Verificar colisão

        for (
            let j =
                meteors.length - 1;

            j >= 0;

            j--
        ) {

            const meteor =
                meteors[j];


            if (

                bullet.x <
                    meteor.x +
                    meteor.width &&

                bullet.x +
                    bullet.width >
                    meteor.x &&

                bullet.y <
                    meteor.y +
                    meteor.height &&

                bullet.y +
                    bullet.height >
                    meteor.y

            ) {

                // Tiro acertou

                meteor.health--;


                bullets.splice(
                    i,
                    1
                );


                createExplosion(

                    bullet.x,
                    bullet.y
                );


                // Meteoros grandes
                // precisam de 2 tiros

                if (
                    meteor.health <= 0
                ) {

                    meteors.splice(
                        j,
                        1
                    );


                    // Grande vale mais pontos

                    if (
                        meteor.isBig
                    ) {

                        score += 6;

                    } else {

                        score += 3;
                    }


                    updateHUD();

                } else {

                    // Meteoro grande
                    // ainda está vivo

                    console.log(
                        "Meteoro grande atingido! Vida restante:",
                        meteor.health
                    );
                }


                break;
            }
        }
    }
}


// ==========================================
// 💥 PARTÍCULAS
// ==========================================

function updateParticles() {

    for (
        let i =
            particles.length - 1;

        i >= 0;

        i--
    ) {

        const particle =
            particles[i];


        particle.x +=
            particle.speedX;

        particle.y +=
            particle.speedY;

        particle.life--;

        particle.size *=
            0.95;


        if (
            particle.life <= 0
        ) {

            particles.splice(
                i,
                1
            );
        }
    }
}


// ==========================================
// DESENHAR PARTÍCULAS
// ==========================================

function drawParticles() {

    for (
        const particle
        of particles
    ) {

        ctx.fillStyle =
            "#ff9d00";

        ctx.globalAlpha =
            particle.life / 30;

        ctx.beginPath();

        ctx.arc(

            particle.x,
            particle.y,

            particle.size,

            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    ctx.globalAlpha = 1;
}


// ==========================================
// 📈 DIFICULDADE
// ==========================================

function updateDifficulty() {

    // A cada aproximadamente
    // 10 segundos aumenta a dificuldade

    difficulty =
        1 +
        Math.floor(
            gameTime / 600
        );


    // Nave fica mais rápida

    player.speed =
        Math.min(

            7 +
            difficulty * 0.8,

            player.maxSpeed
        );
}


// ==========================================
// HUD
// ==========================================

function updateHUD() {

    scoreText.textContent =
        score;

    livesText.textContent =
        lives;

    highScoreText.textContent =
        highScore;
}


// ==========================================
// 🎮 TECLAS
// ==========================================

const keys = {};


document.addEventListener(
    "keydown",

    (event) => {

        keys[event.key] = true;


        // SPACE = atirar

        if (
            event.code ===
            "Space"
        ) {

            event.preventDefault();

            shoot();

            somTiro.currentTime = 0;
            somTiro.play();
        }


        // Evita rolagem

        if (

            event.code ===
                "ArrowLeft" ||

            event.code ===
                "ArrowRight"

        ) {

            event.preventDefault();
        }
    }
);


document.addEventListener(
    "keyup",

    (event) => {

        keys[event.key] = false;
    }
);


// ==========================================
// 🔄 LOOP DO JOGO
// ==========================================

function gameLoop() {

    if (
        !gameRunning
    ) {

        return;
    }


    gameTime++;


    drawBackground();

    movePlayer();

    updateMeteors();

    updateBullets();

    updateParticles();

    updateDifficulty();


    // Desenhar nave

    drawPlayer();


    // Desenhar meteoros

    for (
        const meteor
        of meteors
    ) {

        drawMeteor(
            meteor
        );
    }


    // Desenhar tiros

    for (
        const bullet
        of bullets
    ) {

        drawBullet(
            bullet
        );
    }


    // Partículas

    drawParticles();


    // Pontuação pelo tempo

    if (
        gameTime % 60 === 0
    ) {

        score++;

        updateHUD();
    }


    animationId =
        requestAnimationFrame(
            gameLoop
        );
}


// ==========================================
// ▶️ COMEÇAR JOGO
// ==========================================

function startGame() {

    // Reset

    score = 0;

    lives = 3;

    difficulty = 1;

    gameTime = 0;

    meteorTimer = 0;

    shootCooldown = 0;


    meteors = [];

    bullets = [];

    particles = [];


    resetPlayer();

    createStars();

    updateHUD();


    // Telas

    menu.classList.add(
        "hidden"
    );

    gameOver.classList.add(
        "hidden"
    );

    game.classList.remove(
        "hidden"
    );


    gameRunning = true;


    // 🎵 Música

    musica.currentTime = 0;

    musica.play().catch(
        (error) => {

            console.log(
                "Não foi possível tocar a música:",
                error
            );
        }
    );


    cancelAnimationFrame(
        animationId
    );


    gameLoop();
}


// ==========================================
// 💀 GAME OVER
// ==========================================

function endGame() {

    gameRunning = false;


    cancelAnimationFrame(
        animationId
    );


    // Para música

    musica.pause();

    musica.currentTime = 0;


    // Verifica recorde

    if (
        score > highScore
    ) {

        highScore =
            score;

        localStorage.setItem(

            "naveEscapeHighScore",

            highScore
        );
    }


    // Atualiza textos

    finalScoreText.textContent =
        score;

    highScoreText.textContent =
        highScore;


    // Esconde jogo

    game.classList.add(
        "hidden"
    );


    // Mostra Game Over

    gameOver.classList.remove(
        "hidden"
    );
}


// ==========================================
// 🔄 JOGAR NOVAMENTE
// ==========================================

restartBtn.addEventListener(
    "click",

    () => {

        startGame();
    }
);


// ==========================================
// 🏠 MENU
// ==========================================

menuBtn.addEventListener(
    "click",

    () => {

        gameOver.classList.add(
            "hidden"
        );

        game.classList.add(
            "hidden"
        );

        menu.classList.remove(
            "hidden"
        );


        musica.pause();

        musica.currentTime = 0;
    }
);


// ==========================================
// ▶️ BOTÃO JOGAR
// ==========================================

playBtn.addEventListener(
    "click",

    () => {

        startGame();
    }
);


// ==========================================
// INICIALIZAÇÃO
// ==========================================

highScoreText.textContent =
    highScore;

createStars();

resetPlayer();