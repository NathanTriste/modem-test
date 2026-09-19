// ==========================================
// 🚀 NAVE ESCAPE - 
// ==========================================


// ==========================================
// CANVAS
// ==========================================

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


// ==========================================
// TELAS
// ==========================================

const menu =
    document.getElementById("menu");

const game =
    document.getElementById("game");

const gameOver =
    document.getElementById("gameOver");


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

const powerText =
    document.getElementById("power");


// ==========================================
// 👹 HUD DO BOSS
// ==========================================

const bossHud =
    document.getElementById("bossHud");

const bossName =
    document.getElementById("bossName");

const bossHealthBar =
    document.getElementById("bossHealth");

const bossHealthText =
    document.getElementById("bossHealthText");


// ==========================================
// 🎵 MÚSICA DO MENU
// ==========================================

const musicaMenu =
    new Audio("music/MS1stM.mp3");

musicaMenu.loop = true;

musicaMenu.volume = 0.3;


// ==========================================
// 🎵 MÚSICA DO JOGO
// ==========================================

const musica =
    new Audio("music/NoSuprises.mp3");

musica.loop = true;

musica.volume = 0.3;


// ==========================================
// 🔫 SOM DO TIRO
// ==========================================

const somTiro =
    new Audio("music/laser.mp3");

somTiro.volume = 0.1;


// ==========================================
// TAMANHO DO CANVAS
// ==========================================

function resizeCanvas() {

    canvas.width =
        window.innerWidth;

    canvas.height =
        window.innerHeight;
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

let powerCoins = [];


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
// 👹 SISTEMA DE BOSS
// ==========================================

// Os bosses aparecem nestas pontuações.

const bossStages = [

    {
        score: 200,
        health: 30,
        name: "⚠ BOSS I ⚠",
        color: "#ff4757",
        darkColor: "#7d1520",
        size: 115,
        speed: 0.7
    },

    {
        score: 500,
        health: 50,
        name: "☠ BOSS II ☠",
        color: "#a855f7",
        darkColor: "#42176b",
        size: 145,
        speed: 0.85
    },

    {
        score: 1000,
        health: 80,
        name: "💀 BOSS III 💀",
        color: "#ff9f00",
        darkColor: "#6b3e00",
        size: 180,
        speed: 1
    }

];


let currentBoss = null;

let bossActive = false;

let nextBossIndex = 0;

let defeatedBosses = 0;


// ==========================================
// 🪙 SISTEMA DE PODER
// ==========================================

// Poder começa causando 1 de dano.
//
// Cada moeda aumenta +1 dano
// SOMENTE contra bosses.

let powerLevel = 1;

let powerSpawnTimer = 0;


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

    // Se o boss estiver ativo,
    // meteoros normais não podem nascer.

    if (bossActive) {
        return;
    }


    const size =
        Math.random() * 40 + 25;


    const isBig =
        size >= 45;


    meteors.push({

        x:
            Math.random() *
            (canvas.width - size),

        y:
            -size,

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

        health:
            isBig ? 2 : 1,

        isBig:
            isBig
    });
}


// ==========================================
// 💥 EXPLOSÃO
// ==========================================

function createExplosion(
    x,
    y
) {

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
// 💥 EXPLOSÃO GRANDE DO BOSS
// ==========================================

function createBossExplosion(
    x,
    y
) {

    for (
        let i = 0;
        i < 60;
        i++
    ) {

        particles.push({

            x: x,
            y: y,

            speedX:
                (Math.random() - 0.5) * 15,

            speedY:
                (Math.random() - 0.5) * 15,

            size:
                Math.random() * 7 + 2,

            life:
                Math.random() * 60 + 40
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


    somTiro.currentTime = 0;

    somTiro.play().catch(
        () => {}
    );
}


// ==========================================
// 🌌 FUNDO
// ==========================================

function drawBackground() {

    ctx.fillStyle =
        "#00040f";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    for (
        const star of stars
    ) {

        ctx.fillStyle =
            "#e1deff";


        ctx.globalAlpha =
            Math.random() * 0.7 + 0.3;


        ctx.fillRect(

            star.x,
            star.y,

            star.size,
            star.size
        );


        star.y +=
            star.speed;


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

    ctx.fillStyle =
        "#ff7b00";


    ctx.beginPath();


    ctx.moveTo(
        -10,
        20
    );


    ctx.lineTo(
        0,
        35
    );


    ctx.lineTo(
        10,
        20
    );


    ctx.fill();


    // Corpo

    ctx.fillStyle =
        "#00eaff";


    ctx.beginPath();


    ctx.moveTo(
        0,
        -28
    );


    ctx.lineTo(
        -22,
        25
    );


    ctx.lineTo(
        0,
        17
    );


    ctx.lineTo(
        22,
        25
    );


    ctx.closePath();


    ctx.fill();


    // Cabine

    ctx.fillStyle =
        "#ffffff";


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

function drawMeteor(
    meteor
) {

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


    if (meteor.isBig) {

        ctx.fillStyle =
            "#9b4d32";

    } else {

        ctx.fillStyle =
            "#777";
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
            (Math.PI * 2 / 8) *
            i;


        const randomRadius =
            radius *
            (
                0.75 +
                Math.random() *
                0.25
            );


        const x =
            Math.cos(angle) *
            randomRadius;


        const y =
            Math.sin(angle) *
            randomRadius;


        if (i === 0) {

            ctx.moveTo(
                x,
                y
            );

        } else {

            ctx.lineTo(
                x,
                y
            );
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
// 👹 CRIAR BOSS
// ==========================================

function createBoss(
    stage
) {

    // Limpa todos os meteoros normais.

    meteors = [];


    bullets = [];


    powerCoins = [];


    currentBoss = {

        x:
            canvas.width / 2 -
            stage.size / 2,

        y: 90,

        width:
            stage.size,

        height:
            stage.size,

        speed:
            stage.speed,

        direction: 1,

        health:
            stage.health,

        maxHealth:
            stage.health,

        name:
            stage.name,

        color:
            stage.color,

        darkColor:
            stage.darkColor,

        stage:
            defeatedBosses + 1,

        powerUpTimer:
            0
    };


    bossActive = true;


    powerSpawnTimer = 0;


    bossHud.classList.remove(
        "hidden"
    );


    bossName.textContent =
        stage.name;


    updateBossHUD();
}


// ==========================================
// 👹 ATUALIZAR HUD DO BOSS
// ==========================================

function updateBossHUD() {

    if (
        !currentBoss
    ) {
        return;
    }


    const percentage =
        Math.max(
            0,
            currentBoss.health /
            currentBoss.maxHealth *
            100
        );


    bossHealthBar.style.width =
        percentage + "%";


    bossHealthText.textContent =
        currentBoss.health +
        " / " +
        currentBoss.maxHealth;
}


// ==========================================
// 👹 DESENHAR BOSS
// ==========================================

function drawBoss() {

    if (
        !bossActive ||
        !currentBoss
    ) {
        return;
    }


    const boss =
        currentBoss;


    ctx.save();


    ctx.translate(

        boss.x +
        boss.width / 2,

        boss.y +
        boss.height / 2
    );


    // Brilho externo

    ctx.shadowColor =
        boss.color;


    ctx.shadowBlur =
        30;


    // Corpo

    ctx.fillStyle =
        boss.darkColor;


    ctx.beginPath();


    ctx.arc(

        0,
        0,

        boss.width / 2,

        0,
        Math.PI * 2
    );


    ctx.fill();


    ctx.shadowBlur = 0;


    // Anel externo

    ctx.strokeStyle =
        boss.color;


    ctx.lineWidth = 7;


    ctx.beginPath();


    ctx.arc(

        0,
        0,

        boss.width / 2 - 5,

        0,
        Math.PI * 2
    );


    ctx.stroke();


    // Núcleo

    ctx.fillStyle =
        boss.color;


    ctx.beginPath();


    ctx.arc(

        0,
        0,

        boss.width * 0.23,

        0,
        Math.PI * 2
    );


    ctx.fill();


    // Olho/núcleo central

    ctx.fillStyle =
        "#ffffff";


    ctx.beginPath();


    ctx.arc(

        0,
        0,

        boss.width * 0.09,

        0,
        Math.PI * 2
    );


    ctx.fill();


    // Detalhes

    ctx.strokeStyle =
        boss.color;


    ctx.lineWidth = 4;


    for (
        let i = 0;
        i < 8;
        i++
    ) {

        const angle =
            (
                Math.PI * 2 / 8
            ) * i;


        const x1 =
            Math.cos(angle) *
            boss.width *
            0.30;


        const y1 =
            Math.sin(angle) *
            boss.width *
            0.30;


        const x2 =
            Math.cos(angle) *
            boss.width *
            0.46;


        const y2 =
            Math.sin(angle) *
            boss.width *
            0.46;


        ctx.beginPath();


        ctx.moveTo(
            x1,
            y1
        );


        ctx.lineTo(
            x2,
            y2
        );


        ctx.stroke();
    }


    ctx.restore();
}


// ==========================================
// 👹 MOVIMENTO DO BOSS
// ==========================================

function updateBoss() {

    if (
        !bossActive ||
        !currentBoss
    ) {
        return;
    }


    const boss =
        currentBoss;


    // Movimento lateral lento

    boss.x +=
        boss.speed *
        boss.direction;


    if (
        boss.x <= 10
    ) {

        boss.x = 10;

        boss.direction = 1;
    }


    if (
        boss.x +
        boss.width >=
        canvas.width - 10
    ) {

        boss.x =
            canvas.width -
            boss.width -
            10;

        boss.direction = -1;
    }


    // Pequeno movimento vertical

    boss.y =
        90 +
        Math.sin(
            gameTime * 0.025
        ) * 25;


    // ======================================
    // COLISÃO BOSS X PLAYER
    // ======================================

    if (

        player.x <
            boss.x +
            boss.width &&

        player.x +
            player.width >
            boss.x &&

        player.y <
            boss.y +
            boss.height &&

        player.y +
            player.height >
            boss.y

    ) {

        // O boss tira uma vida,
        // mas não fica causando dano
        // a cada frame.

        lives--;

        updateHUD();


        // Empurra o jogador para baixo

        player.y += 60;


        if (
            lives <= 0
        ) {

            endGame();

            return;
        }
    }


    // ======================================
    // MOEDAS DE PODER
    // ======================================

    powerSpawnTimer++;


    // Aproximadamente a cada 8-15 segundos,
    // existe uma chance de aparecer uma moeda.

    if (
        powerSpawnTimer >=
        500
    ) {

        powerSpawnTimer = 0;


        if (
            Math.random() <
            0.55
        ) {

            createPowerCoin();
        }
    }
}


// ==========================================
// 🪙 CRIAR MOEDA DE PODER
// ==========================================

function createPowerCoin() {

    powerCoins.push({

        x:
            Math.random() *
            (
                canvas.width - 30
            ),

        y:
            -30,

        size: 22,

        speed:
            1.5 +
            Math.random(),

        rotation: 0
    });
}


// ==========================================
// 🪙 ATUALIZAR MOEDAS
// ==========================================

function updatePowerCoins() {

    for (
        let i =
            powerCoins.length - 1;

        i >= 0;

        i--
    ) {

        const coin =
            powerCoins[i];


        coin.y +=
            coin.speed;


        coin.rotation +=
            0.08;


        // Saiu da tela

        if (
            coin.y >
            canvas.height + 40
        ) {

            powerCoins.splice(
                i,
                1
            );

            continue;
        }


        // Colisão com jogador

        if (

            player.x <
                coin.x +
                coin.size &&

            player.x +
                player.width >
                coin.x &&

            player.y <
                coin.y +
                coin.size &&

            player.y +
                player.height >
                coin.y

        ) {

            powerLevel++;


            updateHUD();


            createExplosion(

                coin.x +
                coin.size / 2,

                coin.y +
                coin.size / 2
            );


            powerCoins.splice(
                i,
                1
            );
        }
    }
}


// ==========================================
// 🪙 DESENHAR MOEDAS
// ==========================================

function drawPowerCoins() {

    for (
        const coin of powerCoins
    ) {

        ctx.save();


        ctx.translate(

            coin.x +
            coin.size / 2,

            coin.y +
            coin.size / 2
        );


        ctx.rotate(
            coin.rotation
        );


        ctx.shadowColor =
            "#ffe600";


        ctx.shadowBlur = 20;


        ctx.fillStyle =
            "#ffd700";


        ctx.beginPath();


        ctx.arc(

            0,
            0,

            coin.size / 2,

            0,
            Math.PI * 2
        );


        ctx.fill();


        ctx.shadowBlur = 0;


        ctx.strokeStyle =
            "#fff3a0";


        ctx.lineWidth = 2;


        ctx.stroke();


        ctx.fillStyle =
            "#5c4500";


        ctx.font =
            "bold 14px Arial";


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        ctx.fillText(
            "⚡",
            0,
            1
        );


        ctx.restore();
    }
}


// ==========================================
// 👹 VERIFICAR SE DEVE NASCER BOSS
// ==========================================

function checkBossSpawn() {

    if (
        bossActive
    ) {
        return;
    }


    if (
        nextBossIndex >=
        bossStages.length
    ) {
        return;
    }


    const nextBoss =
        bossStages[nextBossIndex];


    if (
        score >=
        nextBoss.score
    ) {

        createBoss(
            nextBoss
        );


        nextBossIndex++;
    }
}


// ==========================================
// 🔥 DESENHAR TIRO
// ==========================================

function drawBullet(
    bullet
) {

    ctx.save();


    ctx.fillStyle =
        "#ff0000";


    ctx.shadowColor =
        "#ff00c8";


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

    // Nenhum meteoro normal durante boss.

    if (
        bossActive
    ) {

        meteors = [];

        return;
    }


    meteorTimer++;


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


        // Colisão com nave

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


        // ==================================
        // 👹 COLISÃO COM BOSS
        // ==================================

        if (
            bossActive &&
            currentBoss
        ) {

            const boss =
                currentBoss;


            if (

                bullet.x <
                    boss.x +
                    boss.width &&

                bullet.x +
                    bullet.width >
                    boss.x &&

                bullet.y <
                    boss.y +
                    boss.height &&

                bullet.y +
                    bullet.height >
                    boss.y

            ) {

                // Dano depende das moedas.

                boss.health -=
                    powerLevel;


                bullets.splice(
                    i,
                    1
                );


                createExplosion(

                    bullet.x,

                    bullet.y
                );


                updateBossHUD();


                // Boss morreu

                if (
                    boss.health <= 0
                ) {

                    defeatBoss();
                }


                continue;
            }
        }


        // ==================================
        // ☄️ METEOROS NORMAIS
        // ==================================

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

                meteor.health--;


                bullets.splice(
                    i,
                    1
                );


                createExplosion(

                    bullet.x,

                    bullet.y
                );


                if (
                    meteor.health <= 0
                ) {

                    meteors.splice(
                        j,
                        1
                    );


                    if (
                        meteor.isBig
                    ) {

                        score += 6;

                    } else {

                        score += 3;
                    }


                    updateHUD();

                }


                break;
            }
        }
    }
}


// ==========================================
// 👹 DERROTAR BOSS
// ==========================================

function defeatBoss() {

    if (
        !currentBoss
    ) {
        return;
    }


    const boss =
        currentBoss;


    createBossExplosion(

        boss.x +
        boss.width / 2,

        boss.y +
        boss.height / 2
    );


    // Pontos extras por derrotar boss

    score +=
        25 *
        boss.stage;


    defeatedBosses++;


    bossActive = false;

    currentBoss = null;


    powerCoins = [];


    bossHud.classList.add(
        "hidden"
    );


    updateHUD();
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
            particle.life /
            30;


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

    difficulty =
        1 +
        Math.floor(
            gameTime / 600
        );


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


    powerText.textContent =
        powerLevel;
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


    // Boss ou meteoros normais

    if (
        bossActive
    ) {

        updateBoss();

        updatePowerCoins();

    } else {

        updateMeteors();

    }


    updateBullets();


    updateParticles();


    updateDifficulty();


    // Verifica nascimento do boss

    checkBossSpawn();


    // ======================================
    // DESENHOS
    // ======================================

    drawPlayer();


    for (
        const meteor
        of meteors
    ) {

        drawMeteor(
            meteor
        );
    }


    if (
        bossActive
    ) {

        drawBoss();

        drawPowerCoins();
    }


    for (
        const bullet
        of bullets
    ) {

        drawBullet(
            bullet
        );
    }


    drawParticles();


    // ======================================
    // PONTUAÇÃO PELO TEMPO
    // ======================================

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


    // Reset bosses

    currentBoss = null;

    bossActive = false;

    nextBossIndex = 0;

    defeatedBosses = 0;


    // Reset poder

    powerLevel = 1;

    powerSpawnTimer = 0;


    meteors = [];

    bullets = [];

    particles = [];

    powerCoins = [];


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


    bossHud.classList.add(
        "hidden"
    );


    gameRunning = true;


    // ======================================
    // 🎵 TROCA MÚSICA MENU → JOGO
    // ======================================

    musicaMenu.pause();

    musicaMenu.currentTime = 0;


    musica.currentTime = 0;


    musica.play().catch(
        (error) => {

            console.log(
                "Não foi possível tocar a música do jogo:",
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


    // Para música do jogo

    musica.pause();

    musica.currentTime = 0;


    // Para música do menu

    musicaMenu.pause();

    musicaMenu.currentTime = 0;


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


    bossHud.classList.add(
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


        bossHud.classList.add(
            "hidden"
        );


        gameRunning = false;


        // Para música do jogo

        musica.pause();

        musica.currentTime = 0;


        // Volta música do menu

        musicaMenu.currentTime = 0;

        musicaMenu.play().catch(
            () => {}
        );
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
// 🎵 TENTAR INICIAR MÚSICA DO MENU
// ==========================================

// Alguns navegadores bloqueiam autoplay.
// Por isso também usamos o primeiro clique
// do usuário para garantir a música.

function iniciarMusicaMenu() {

    if (
        gameRunning
    ) {
        return;
    }


    musicaMenu.play().catch(
        () => {}
    );
}


document.addEventListener(
    "click",
    iniciarMusicaMenu,
    {
        once: true
    }
);


// ==========================================
// INICIALIZAÇÃO
// ==========================================

highScoreText.textContent =
    highScore;


createStars();


resetPlayer();


// Tenta iniciar a música
// assim que a página abre.

musicaMenu.play().catch(
    () => {

        console.log(
            "O navegador bloqueou o autoplay da música do menu."
        );
    }
);