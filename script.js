const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const game = document.getElementById("game");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const menuBtn = document.getElementById("menuBtn");

const gameOverScreen = document.getElementById("gameOver");

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const highScoreEl = document.getElementById("highScore");
const finalScoreEl = document.getElementById("finalScore");

const powerEl = document.getElementById("power");

const bossHud = document.getElementById("bossHud");
const bossName = document.getElementById("bossName");
const bossHealthBar = document.getElementById("bossHealthBar");
const bossHealthText = document.getElementById("bossHealthText");

const soundBtn = document.getElementById("soundBtn");

const welcomeOverlay =
    document.getElementById("welcomeOverlay");

const closeWelcome =
    document.getElementById("closeWelcome");

const enterGame =
    document.getElementById("enterGame");


/* =========================================================
   CANVAS
========================================================= */

function resizeCanvas() {

    canvas.width = window.innerWidth;

    canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);


/* =========================================================
   ÁUDIO
========================================================= */

const musicaMenu =
    new Audio("music/MS1stM.mp3");

const musicaJogo =
    new Audio("music/NoSuprises.mp3");

const somLaser =
    new Audio("music/laser.mp3");


musicaMenu.loop = true;
musicaJogo.loop = true;

musicaMenu.volume = 0.25;
musicaJogo.volume = 0.20;
somLaser.volume = 0.40;


let soundEnabled = true;


function atualizarBotaoSom() {

    soundBtn.textContent =
        soundEnabled ? "🔊" : "🔇";

}


function pararTodosOsSons() {

    musicaMenu.pause();

    musicaJogo.pause();

}


function tocarMusicaMenu() {

    if (!soundEnabled) return;

    musicaJogo.pause();

    musicaMenu.play().catch(() => {});

}


function tocarMusicaJogo() {

    if (!soundEnabled) return;

    musicaMenu.pause();

    musicaJogo.play().catch(() => {});

}


soundBtn.addEventListener("click", () => {

    soundEnabled = !soundEnabled;

    atualizarBotaoSom();


    if (!soundEnabled) {

        musicaMenu.pause();

        musicaJogo.pause();

    } else {

        if (game.style.display !== "none") {

            if (!gameOver) {

                tocarMusicaJogo();

            }

        } else {

            tocarMusicaMenu();

        }

    }

});


/* =========================================================
   POPUP
========================================================= */

function fecharWelcome() {

    welcomeOverlay.style.display = "none";

    tocarMusicaMenu();

}


closeWelcome.addEventListener(
    "click",
    fecharWelcome
);


enterGame.addEventListener(
    "click",
    fecharWelcome
);


/* =========================================================
   VARIÁVEIS
========================================================= */

let gameRunning = false;

let gameOver = false;

let score = 0;

let lives = 3;

let highScore =
    Number(
        localStorage.getItem(
            "naveEscapeHighScore"
        )
    ) || 0;


highScoreEl.textContent = highScore;


/* =========================================================
   SISTEMA DE INVENCIBILIDADE
========================================================= */

/*
    COMANDO DO CONSOLE:

    nv.true//inprecio.2.0//true

    ativa.

    nv.false//inprecio.2.0//false

    desativa.

    O motivo de ser "false" no segundo
    é que "//" transforma o restante
    da linha em comentário.
*/

window.nv = {

    true: function() {

        window.nvGodMode = true;

        console.log(
            "🛡️ NV TRUE — INVENCIBILIDADE ATIVADA"
        );

    },

    false: function() {

        window.nvGodMode = false;

        console.log(
            "⚠️ NV FALSE — INVENCIBILIDADE DESATIVADA"
        );

    }

};


window.nvGodMode = false;


/*
   Também permite:

   nv.true()
   nv.false()

   caso queira usar de forma mais simples.
*/

console.log(
    "🛠️ System of Burla: comandos de teste carregados."
);

console.log(
    "Use nv.true() para ativar invencibilidade."
);

console.log(
    "Use nv.false() para desativar."
);


/* =========================================================
   NAVE
========================================================= */

const player = {

    x: 0,

    y: 0,

    width: 42,

    height: 52,

    speed: 6,

    invulnerable: 0

};


/* =========================================================
   CONTROLES
========================================================= */

const keys = {};

document.addEventListener(
    "keydown",
    (event) => {

        keys[event.key.toLowerCase()] = true;


        if (

            event.code === "Space" ||

            event.key === "ArrowUp" ||

            event.key === "ArrowDown" ||

            event.key === "ArrowLeft" ||

            event.key === "ArrowRight"

        ) {

            event.preventDefault();

        }

    }
);


document.addEventListener(
    "keyup",
    (event) => {

        keys[event.key.toLowerCase()] = false;

    }
);


/* =========================================================
   OBJETOS
========================================================= */

let meteors = [];

let bullets = [];

let particles = [];

let stars = [];

let powerCoins = [];

let bossProjectiles = [];


/* =========================================================
   METEOROS
========================================================= */

const METEOR_MAX_SPEED = 7.5;

let meteorSpawnTimer = 0;


/* =========================================================
   BOSSES
========================================================= */

const bossStages = [

    {
        score: 200,

        health: 60,

        name: "⚠ BOSS I ⚠",

        color: "#ff4757",

        darkColor: "#72151d",

        size: 125,

        speed: 0.65,

        projectileSpeed: 3.2,

        fireRate: 115
    },

    {
        score: 500,

        health: 110,

        name: "☠ BOSS II ☠",

        color: "#a855f7",

        darkColor: "#42176b",

        size: 155,

        speed: 0.80,

        projectileSpeed: 4.0,

        fireRate: 90
    },

    {
        score: 1000,

        health: 180,

        name: "💀 BOSS III 💀",

        color: "#ff9f00",

        darkColor: "#6b3e00",

        size: 190,

        speed: 0.95,

        projectileSpeed: 4.8,

        fireRate: 70
    }

];


let currentBoss = null;

let bossActive = false;

let nextBossIndex = 0;

let defeatedBosses = 0;


/* =========================================================
   POWER
========================================================= */

let powerLevel = 1;

let powerSpawnTimer = 0;


/* =========================================================
   ESTRELAS
========================================================= */

function createStars() {

    stars = [];

    for (let i = 0; i < 100; i++) {

        stars.push({

            x: Math.random() * canvas.width,

            y: Math.random() * canvas.height,

            size: Math.random() * 2,

            speed:
                Math.random() * 1.5 + 0.3

        });

    }

}

createStars();


/* =========================================================
   RESET
========================================================= */

function resetGame() {

    score = 0;

    lives = 3;

    meteors = [];

    bullets = [];

    particles = [];

    powerCoins = [];

    bossProjectiles = [];

    currentBoss = null;

    bossActive = false;

    nextBossIndex = 0;

    defeatedBosses = 0;

    powerLevel = 1;

    powerSpawnTimer = 0;

    meteorSpawnTimer = 0;

    player.x = canvas.width / 2;

    player.y = canvas.height - 100;

    player.invulnerable = 0;

    scoreEl.textContent = score;

    livesEl.textContent = lives;

    powerEl.textContent = powerLevel;

    bossHud.style.display = "none";

}


/* =========================================================
   INICIAR
========================================================= */

function startGame() {

    resetGame();

    gameRunning = true;

    gameOver = false;

    menu.style.display = "none";

    game.style.display = "block";

    gameOverScreen.style.display = "none";

    tocarMusicaJogo();

    requestAnimationFrame(gameLoop);

}


startBtn.addEventListener(
    "click",
    startGame
);


restartBtn.addEventListener(
    "click",
    startGame
);


/* =========================================================
   MENU
========================================================= */

menuBtn.addEventListener(
    "click",
    () => {

        gameRunning = false;

        gameOver = false;

        game.style.display = "none";

        menu.style.display = "flex";

        gameOverScreen.style.display = "none";

        bossHud.style.display = "none";

        pararTodosOsSons();

        tocarMusicaMenu();

    }
);


/* =========================================================
   CRIAR METEORO
========================================================= */

function createMeteor() {

    if (bossActive) return;


    const size =
        Math.random() * 40 + 25;


    /*
       A velocidade cresce com a pontuação.

       Mas nunca passa de 7.5.
    */

    const speed = Math.min(

        2.2 +
        (score / 100) * 0.35,

        METEOR_MAX_SPEED

    );


    meteors.push({

        x:
            Math.random() *
            (canvas.width - size),

        y: -size,

        size: size,

        speed: speed,

        health:
            size >= 45 ? 2 : 1,

        rotation:
            Math.random() *
            Math.PI * 2,

        rotationSpeed:
            (Math.random() - 0.5) * 0.04

    });

}


/* =========================================================
   METEOROS
========================================================= */

function updateMeteors() {

    for (
        let i = meteors.length - 1;
        i >= 0;
        i--
    ) {

        const meteor = meteors[i];

        meteor.y += meteor.speed;

        meteor.rotation +=
            meteor.rotationSpeed;


        if (
            meteor.y >
            canvas.height +
            meteor.size
        ) {

            meteors.splice(i, 1);

            continue;

        }


        if (

            player.invulnerable <= 0 &&

            !window.nvGodMode &&

            circleRectCollision(

                meteor.x +
                meteor.size / 2,

                meteor.y +
                meteor.size / 2,

                meteor.size / 2,

                player.x -
                player.width / 2,

                player.y -
                player.height / 2,

                player.width,

                player.height

            )

        ) {

            meteors.splice(i, 1);

            loseLife();

        }

    }

}


/* =========================================================
   TIRO
========================================================= */

function shoot() {

    if (!gameRunning || gameOver) return;


    bullets.push({

        x: player.x,

        y: player.y - 25,

        speed: 11,

        width: 4,

        height: 18

    });


    if (soundEnabled) {

        const laser =
            somLaser.cloneNode();

        laser.volume =
            somLaser.volume;

        laser.play().catch(() => {});

    }

}


let shootCooldown = 0;


/* =========================================================
   TIROS
========================================================= */

function updateBullets() {

    for (
        let i = bullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet = bullets[i];

        bullet.y -= bullet.speed;


        if (bullet.y < -30) {

            bullets.splice(i, 1);

            continue;

        }


        /* BOSS */

        if (
            bossActive &&
            currentBoss
        ) {

            const distance =
                Math.hypot(

                    bullet.x -
                    currentBoss.x,

                    bullet.y -
                    currentBoss.y

                );


            if (

                distance <
                currentBoss.size * 0.5

            ) {

                currentBoss.health -=
                    powerLevel;

                bullets.splice(i, 1);


                createExplosion(

                    bullet.x,

                    bullet.y,

                    currentBoss.color

                );


                updateBossHud();


                if (
                    currentBoss.health <= 0
                ) {

                    defeatBoss();

                }


                continue;

            }

        }


        /* METEOROS */

        for (
            let j = meteors.length - 1;
            j >= 0;
            j--
        ) {

            const meteor = meteors[j];

            const distance =
                Math.hypot(

                    bullet.x -
                    (
                        meteor.x +
                        meteor.size / 2
                    ),

                    bullet.y -
                    (
                        meteor.y +
                        meteor.size / 2
                    )

                );


            if (
                distance <
                meteor.size / 2
            ) {

                meteor.health--;

                bullets.splice(i, 1);


                createExplosion(

                    bullet.x,

                    bullet.y,

                    "#ffffff"

                );


                if (
                    meteor.health <= 0
                ) {

                    score +=
                        meteor.size >= 45
                            ? 6
                            : 3;

                    meteors.splice(j, 1);

                }

                break;

            }

        }

    }

}


/* =========================================================
   BOSS SPAWN
========================================================= */

function checkBossSpawn() {

    if (bossActive) return;

    if (
        nextBossIndex >=
        bossStages.length
    ) return;


    const stage =
        bossStages[nextBossIndex];


    if (
        score >= stage.score
    ) {

        createBoss(stage);

        nextBossIndex++;

    }

}


/* =========================================================
   CRIAR BOSS
========================================================= */

function createBoss(stage) {

    meteors = [];

    bullets = [];

    powerCoins = [];

    bossProjectiles = [];


    currentBoss = {

        ...stage,

        x: canvas.width / 2,

        y: 130,

        health: stage.health,

        maxHealth: stage.health,

        direction:
            Math.random() > 0.5
                ? 1
                : -1,

        fireTimer: 0,

        movementTime: 0

    };


    bossActive = true;

    bossHud.style.display =
        "block";

    updateBossHud();

}


/* =========================================================
   HUD BOSS
========================================================= */

function updateBossHud() {

    if (!currentBoss) return;


    bossName.textContent =
        currentBoss.name;

    bossName.style.color =
        currentBoss.color;


    const percentage =
        Math.max(

            0,

            currentBoss.health /
            currentBoss.maxHealth *
            100

        );


    bossHealthBar.style.width =
        percentage + "%";


    bossHealthBar.style.background =
        currentBoss.color;


    bossHealthText.textContent =

        `${Math.max(
            0,
            currentBoss.health
        )} / ${currentBoss.maxHealth}`;

}


/* =========================================================
   BOSS
========================================================= */

function updateBoss() {

    if (
        !bossActive ||
        !currentBoss
    ) return;


    const boss = currentBoss;


    boss.movementTime += 0.02;


    boss.x +=
        boss.direction *
        boss.speed;


    boss.y =
        130 +
        Math.sin(
            boss.movementTime
        ) * 35;


    if (

        boss.x <
        boss.size / 2 ||

        boss.x >
        canvas.width -
        boss.size / 2

    ) {

        boss.direction *= -1;

    }


    /*
       Ataque
    */

    boss.fireTimer++;


    if (
        boss.fireTimer >=
        boss.fireRate
    ) {

        boss.fireTimer = 0;

        shootBossProjectile();

    }


    /*
       Colisão direta
    */

    if (

        player.invulnerable <= 0 &&

        !window.nvGodMode &&

        circleRectCollision(

            boss.x,

            boss.y,

            boss.size * 0.45,

            player.x -
            player.width / 2,

            player.y -
            player.height / 2,

            player.width,

            player.height

        )

    ) {

        loseLife();

    }

}


/* =========================================================
   PEDRAS DO BOSS
========================================================= */

function shootBossProjectile() {

    if (!currentBoss) return;


    const boss =
        currentBoss;


    const dx =
        player.x - boss.x;

    const dy =
        player.y - boss.y;


    const distance =
        Math.hypot(dx, dy);


    const speed =
        boss.projectileSpeed;


    bossProjectiles.push({

        x: boss.x,

        y:
            boss.y +
            boss.size * 0.3,

        vx:
            (dx / distance) *
            speed,

        vy:
            (dy / distance) *
            speed,

        size:
            15 +
            Math.random() * 8,

        rotation:
            Math.random() *
            Math.PI * 2,

        rotationSpeed:
            (Math.random() - 0.5) * 0.1,

        color:
            boss.color

    });

}


/* =========================================================
   PROJÉTEIS
========================================================= */

function updateBossProjectiles() {

    for (
        let i =
            bossProjectiles.length - 1;
        i >= 0;
        i--
    ) {

        const projectile =
            bossProjectiles[i];


        projectile.x +=
            projectile.vx;

        projectile.y +=
            projectile.vy;

        projectile.rotation +=
            projectile.rotationSpeed;


        if (

            projectile.x < -50 ||

            projectile.x >
            canvas.width + 50 ||

            projectile.y < -50 ||

            projectile.y >
            canvas.height + 50

        ) {

            bossProjectiles.splice(
                i,
                1
            );

            continue;

        }


        if (

            player.invulnerable <= 0 &&

            !window.nvGodMode &&

            circleRectCollision(

                projectile.x,

                projectile.y,

                projectile.size,

                player.x -
                player.width / 2,

                player.y -
                player.height / 2,

                player.width,

                player.height

            )

        ) {

            bossProjectiles.splice(
                i,
                1
            );

            loseLife();

        }

    }

}


/* =========================================================
   MORTE DO BOSS
========================================================= */

function defeatBoss() {

    const defeatedStage =
        currentBoss;


    createExplosion(

        currentBoss.x,

        currentBoss.y,

        currentBoss.color

    );


    score +=
        25 * defeatedBosses +
        25;


    defeatedBosses++;


    currentBoss = null;

    bossActive = false;

    bossProjectiles = [];

    powerCoins = [];

    bossHud.style.display =
        "none";


    scoreEl.textContent =
        score;


    for (let i = 0; i < 30; i++) {

        particles.push({

            x: canvas.width / 2,

            y: 150,

            vx:
                (Math.random() - 0.5) *
                10,

            vy:
                (Math.random() - 0.5) *
                10,

            life: 60,

            size:
                Math.random() * 5 + 2,

            color:
                defeatedStage.color

        });

    }

}


/* =========================================================
   POWER COINS
========================================================= */

function createPowerCoin() {

    if (!bossActive) return;


    powerCoins.push({

        x:
            Math.random() *
            (canvas.width - 80) +
            40,

        y: -30,

        size: 15,

        speed: 2.5,

        rotation: 0

    });

}


function updatePowerCoins() {

    if (!bossActive) return;


    powerSpawnTimer++;


    if (
        powerSpawnTimer >= 480
    ) {

        powerSpawnTimer = 0;


        if (
            Math.random() < 0.45
        ) {

            createPowerCoin();

        }

    }


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

        coin.rotation += 0.08;


        if (
            coin.y >
            canvas.height + 30
        ) {

            powerCoins.splice(i, 1);

            continue;

        }


        const distance =
            Math.hypot(

                player.x - coin.x,

                player.y - coin.y

            );


        if (
            distance < 35
        ) {

            powerLevel++;

            powerEl.textContent =
                powerLevel;

            powerCoins.splice(i, 1);


            createExplosion(

                coin.x,

                coin.y,

                "#ffd32a"

            );

        }

    }

}


/* =========================================================
   COLISÃO
========================================================= */

function circleRectCollision(

    circleX,
    circleY,
    radius,
    rectX,
    rectY,
    rectWidth,
    rectHeight

) {

    const closestX =
        Math.max(

            rectX,

            Math.min(
                circleX,
                rectX + rectWidth
            )

        );


    const closestY =
        Math.max(

            rectY,

            Math.min(
                circleY,
                rectY + rectHeight
            )

        );


    const distanceX =
        circleX - closestX;

    const distanceY =
        circleY - closestY;


    return (

        distanceX *
        distanceX +

        distanceY *
        distanceY

    ) < radius * radius;

}


/* =========================================================
   PERDER VIDA
========================================================= */

function loseLife() {

    /*
       MODO DE TESTE:

       Se nvGodMode estiver ligado,
       nada acontece.
    */

    if (
        window.nvGodMode
    ) {

        return;

    }


    if (
        player.invulnerable > 0
    ) {

        return;

    }


    lives--;

    livesEl.textContent =
        lives;


    /*
       90 frames de invulnerabilidade
       após tomar dano.
    */

    player.invulnerable = 90;


    createExplosion(

        player.x,

        player.y,

        "#00e5ff"

    );


    if (lives <= 0) {

        endGame();

    }

}


/* =========================================================
   EXPLOSÃO
========================================================= */

function createExplosion(
    x,
    y,
    color
) {

    for (
        let i = 0;
        i < 12;
        i++
    ) {

        particles.push({

            x: x,

            y: y,

            vx:
                (Math.random() - 0.5) *
                6,

            vy:
                (Math.random() - 0.5) *
                6,

            life:
                30 +
                Math.random() * 20,

            size:
                Math.random() * 4 + 1,

            color:
                color

        });

    }

}


/* =========================================================
   PARTÍCULAS
========================================================= */

function updateParticles() {

    for (
        let i =
            particles.length - 1;
        i >= 0;
        i--
    ) {

        const p =
            particles[i];


        p.x += p.vx;

        p.y += p.vy;

        p.life--;

        p.size *= 0.97;


        if (
            p.life <= 0
        ) {

            particles.splice(i, 1);

        }

    }

}


/* =========================================================
   ESTRELAS
========================================================= */

function updateStars() {

    for (
        const star of stars
    ) {

        star.y +=
            star.speed;


        if (
            star.y >
            canvas.height
        ) {

            star.y = 0;

            star.x =
                Math.random() *
                canvas.width;

        }

    }

}


function drawStars() {

    ctx.fillStyle = "#fff";


    for (
        const star of stars
    ) {

        ctx.globalAlpha =
            0.4 +
            star.size / 3;


        ctx.fillRect(

            star.x,

            star.y,

            star.size,

            star.size

        );

    }


    ctx.globalAlpha = 1;

}


/* =========================================================
   NAVE
========================================================= */

function drawPlayer() {

    ctx.save();


    ctx.translate(
        player.x,
        player.y
    );


    if (

        player.invulnerable > 0 &&

        Math.floor(
            player.invulnerable / 6
        ) % 2 === 0

    ) {

        ctx.globalAlpha = 0.3;

    }


    /*
       Fogo
    */

    ctx.beginPath();

    ctx.moveTo(-10, 20);

    ctx.lineTo(
        0,
        35 +
        Math.random() * 8
    );

    ctx.lineTo(10, 20);

    ctx.fillStyle =
        "#ff8c00";

    ctx.fill();


    /*
       Corpo
    */

    ctx.beginPath();

    ctx.moveTo(0, -28);

    ctx.lineTo(-21, 22);

    ctx.lineTo(0, 14);

    ctx.lineTo(21, 22);

    ctx.closePath();

    ctx.fillStyle =
        "#00e5ff";

    ctx.fill();


    /*
       Cabine
    */

    ctx.beginPath();

    ctx.arc(
        0,
        -5,
        7,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#fff";

    ctx.fill();


    ctx.restore();

}


/* =========================================================
   METEOROS
========================================================= */

function drawMeteors() {

    for (
        const meteor of meteors
    ) {

        ctx.save();


        ctx.translate(

            meteor.x +
            meteor.size / 2,

            meteor.y +
            meteor.size / 2

        );


        ctx.rotate(
            meteor.rotation
        );


        ctx.beginPath();


        const radius =
            meteor.size / 2;


        for (
            let i = 0;
            i < 8;
            i++
        ) {

            const angle =
                (Math.PI * 2 / 8) *
                i;


            const variation =
                radius *
                (
                    0.8 +
                    Math.random() *
                    0.2
                );


            const x =
                Math.cos(angle) *
                variation;

            const y =
                Math.sin(angle) *
                variation;


            if (i === 0) {

                ctx.moveTo(x, y);

            } else {

                ctx.lineTo(x, y);

            }

        }


        ctx.closePath();

        ctx.fillStyle =
            "#777";

        ctx.fill();

        ctx.strokeStyle =
            "#aaa";

        ctx.stroke();


        ctx.restore();

    }

}


/* =========================================================
   TIROS
========================================================= */

function drawBullets() {

    ctx.fillStyle =
        "#00e5ff";


    for (
        const bullet of bullets
    ) {

        ctx.fillRect(

            bullet.x -
            bullet.width / 2,

            bullet.y,

            bullet.width,

            bullet.height

        );

    }

}


/* =========================================================
   POWER COINS
========================================================= */

function drawPowerCoins() {

    for (
        const coin of powerCoins
    ) {

        ctx.save();


        ctx.translate(
            coin.x,
            coin.y
        );


        ctx.rotate(
            coin.rotation
        );


        ctx.beginPath();

        ctx.arc(

            0,
            0,
            coin.size,
            0,
            Math.PI * 2

        );


        ctx.fillStyle =
            "#ffd32a";

        ctx.fill();


        ctx.strokeStyle =
            "#fff";

        ctx.lineWidth = 2;

        ctx.stroke();


        ctx.fillStyle =
            "#7a5a00";

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


/* =========================================================
   PEDRAS
========================================================= */

function drawBossProjectiles() {

    for (
        const projectile of bossProjectiles
    ) {

        ctx.save();


        ctx.translate(

            projectile.x,

            projectile.y

        );


        ctx.rotate(
            projectile.rotation
        );


        ctx.beginPath();


        ctx.moveTo(
            -projectile.size,
            0
        );


        ctx.lineTo(

            -projectile.size * 0.3,

            -projectile.size * 0.8

        );


        ctx.lineTo(

            projectile.size * 0.8,

            -projectile.size * 0.45

        );


        ctx.lineTo(

            projectile.size,

            projectile.size * 0.3

        );


        ctx.lineTo(

            projectile.size * 0.2,

            projectile.size

        );


        ctx.lineTo(

            -projectile.size * 0.8,

            projectile.size * 0.55

        );


        ctx.closePath();


        ctx.fillStyle =
            "#555";

        ctx.fill();


        ctx.strokeStyle =
            projectile.color;

        ctx.lineWidth = 2;

        ctx.stroke();


        ctx.restore();

    }

}


/* =========================================================
   BOSS
========================================================= */

function drawBoss() {

    if (
        !bossActive ||
        !currentBoss
    ) return;


    const boss =
        currentBoss;


    ctx.save();


    ctx.translate(
        boss.x,
        boss.y
    );


    const gradient =
        ctx.createRadialGradient(

            0,
            0,
            boss.size * 0.2,

            0,
            0,
            boss.size

        );


    gradient.addColorStop(
        0,
        boss.color
    );


    gradient.addColorStop(
        1,
        boss.darkColor
    );


    ctx.fillStyle =
        gradient;


    ctx.beginPath();


    ctx.arc(

        0,
        0,
        boss.size / 2,
        0,
        Math.PI * 2

    );


    ctx.fill();


    ctx.strokeStyle =
        boss.color;

    ctx.lineWidth = 5;

    ctx.stroke();


    /*
       Olho
    */

    ctx.fillStyle =
        "#000";


    ctx.beginPath();

    ctx.arc(

        0,
        0,
        boss.size * 0.16,
        0,
        Math.PI * 2

    );

    ctx.fill();


    ctx.fillStyle =
        "#fff";


    ctx.beginPath();

    ctx.arc(

        0,
        0,
        boss.size * 0.08,
        0,
        Math.PI * 2

    );

    ctx.fill();


    /*
       Pontas
    */

    ctx.fillStyle =
        boss.darkColor;


    for (
        let i = 0;
        i < 8;
        i++
    ) {

        const angle =
            (Math.PI * 2 / 8) *
            i;


        ctx.beginPath();


        ctx.moveTo(

            Math.cos(angle) *
            boss.size * 0.25,

            Math.sin(angle) *
            boss.size * 0.25

        );


        ctx.lineTo(

            Math.cos(angle) *
            boss.size * 0.75,

            Math.sin(angle) *
            boss.size * 0.75

        );


        ctx.lineTo(

            Math.cos(angle + 0.2) *
            boss.size * 0.5,

            Math.sin(angle + 0.2) *
            boss.size * 0.5

        );


        ctx.closePath();

        ctx.fill();

    }


    ctx.restore();

}


/* =========================================================
   PARTÍCULAS
========================================================= */

function drawParticles() {

    for (
        const p of particles
    ) {

        ctx.globalAlpha =
            Math.max(
                0,
                p.life / 50
            );


        ctx.fillStyle =
            p.color;


        ctx.fillRect(

            p.x,

            p.y,

            p.size,

            p.size

        );

    }


    ctx.globalAlpha = 1;

}


/* =========================================================
   PLAYER
========================================================= */

function updatePlayer() {

    if (
        keys["arrowleft"] ||
        keys["a"]
    ) {

        player.x -=
            player.speed;

    }


    if (
        keys["arrowright"] ||
        keys["d"]
    ) {

        player.x +=
            player.speed;

    }


    if (
        keys["arrowup"] ||
        keys["w"]
    ) {

        player.y -=
            player.speed;

    }


    if (
        keys["arrowdown"] ||
        keys["s"]
    ) {

        player.y +=
            player.speed;

    }


    player.x =
        Math.max(

            player.width / 2,

            Math.min(

                canvas.width -
                player.width / 2,

                player.x

            )

        );


    player.y =
        Math.max(

            player.height / 2,

            Math.min(

                canvas.height -
                player.height / 2,

                player.y

            )

        );


    if (
        player.invulnerable > 0
    ) {

        player.invulnerable--;

    }


    if (
        shootCooldown > 0
    ) {

        shootCooldown--;

    }


    if (

        keys[" "] &&

        shootCooldown <= 0

    ) {

        shoot();

        shootCooldown = 12;

    }

}


/* =========================================================
   GAME OVER
========================================================= */

function endGame() {

    gameRunning = false;

    gameOver = true;


    finalScoreEl.textContent =
        score;


    if (
        score > highScore
    ) {

        highScore = score;


        localStorage.setItem(

            "naveEscapeHighScore",

            highScore

        );


        highScoreEl.textContent =
            highScore;

    }


    musicaJogo.pause();


    gameOverScreen.style.display =
        "flex";

}


/* =========================================================
   LOOP
========================================================= */

let frameCount = 0;


function gameLoop() {

    if (!gameRunning) return;


    frameCount++;


    ctx.clearRect(

        0,
        0,
        canvas.width,
        canvas.height

    );


    ctx.fillStyle =
        "#000";


    ctx.fillRect(

        0,
        0,
        canvas.width,
        canvas.height

    );


    updateStars();

    drawStars();


    updatePlayer();


    /*
       Quantidade fixa de meteoros.

       O que muda com o tempo é a velocidade.
    */

    if (!bossActive) {

        meteorSpawnTimer++;


        if (
            meteorSpawnTimer >= 38
        ) {

            meteorSpawnTimer = 0;

            createMeteor();

        }

    }


    updateMeteors();

    updateBullets();

    updateBoss();

    updateBossProjectiles();

    updatePowerCoins();

    updateParticles();


    drawMeteors();

    drawPowerCoins();

    drawBossProjectiles();

    drawBoss();

    drawBullets();

    drawParticles();

    drawPlayer();


    /*
       Pontuação continua normalmente,
       inclusive durante boss.
    */

    if (
        frameCount % 60 === 0
    ) {

        score++;

        scoreEl.textContent =
            score;

    }


    checkBossSpawn();


    requestAnimationFrame(
        gameLoop
    );

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

atualizarBotaoSom();

resetGame();