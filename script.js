/* =========================================================
   SYSTEM OF BURLA
   Nave Escape
   ========================================================= */


/* =========================================================
   CANVAS
========================================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();


/* =========================================================
   TELAS
========================================================= */

const menu = document.getElementById("menu");
const game = document.getElementById("game");
const gameOverScreen = document.getElementById("gameOver");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const menuBtn = document.getElementById("menuBtn");


/* =========================================================
   HUD
========================================================= */

const scoreText = document.getElementById("score");
const livesText = document.getElementById("lives");
const highScoreText = document.getElementById("highScore");
const powerText = document.getElementById("powerLevel");

const finalScoreText = document.getElementById("finalScore");
const finalHighScoreText = document.getElementById("finalHighScore");

const bossHud = document.getElementById("bossHud");
const bossNameText = document.getElementById("bossName");
const bossBar = document.getElementById("bossBar");
const bossHpText = document.getElementById("bossHpText");
const bossWarning = document.getElementById("bossWarning");


/* =========================================================
   ÁUDIO
========================================================= */

const menuMusic = document.getElementById("menuMusic");
const gameMusic = document.getElementById("gameMusic");
const laserSound = document.getElementById("laserSound");

let soundEnabled = true;

menuMusic.volume = 0.3;
gameMusic.volume = 0.3;
laserSound.volume = 0.1;


/*
    Garante que os arquivos sejam carregados.
*/

menuMusic.load();
gameMusic.load();
laserSound.load();


/*
    Mostra no console caso algum arquivo de áudio
    não seja encontrado ou não possa ser carregado.
*/

menuMusic.addEventListener("error", () => {
    console.error("❌ Erro ao carregar music/MS1stM.mp3");
});

gameMusic.addEventListener("error", () => {
    console.error("❌ Erro ao carregar music/NoSuprises.mp3");
});

laserSound.addEventListener("error", () => {
    console.error("❌ Erro ao carregar music/laser.mp3");
});


const soundBtn = document.getElementById("soundBtn");


function tocarMusicaMenu() {

    if (!soundEnabled) return;

    gameMusic.pause();

    menuMusic.volume = 0.4;

    menuMusic.play().catch((error) => {
        console.warn("⚠️ Não foi possível iniciar a música do menu:", error);
    });

}


function tocarMusicaJogo() {

    if (!soundEnabled) return;

    menuMusic.pause();

    gameMusic.currentTime = 0;
    gameMusic.volume = 0.4;

    gameMusic.play().catch((error) => {
        console.warn("⚠️ Não foi possível iniciar a música do jogo:", error);
    });

}


function pararMusicas() {

    menuMusic.pause();
    gameMusic.pause();

}


soundBtn.addEventListener("click", () => {

    soundEnabled = !soundEnabled;

    if (soundEnabled) {

        soundBtn.textContent = "🔊";

        if (!game.classList.contains("hidden")) {
            tocarMusicaJogo();
        } else {
            tocarMusicaMenu();
        }

    } else {

        soundBtn.textContent = "🔇";

        menuMusic.pause();
        gameMusic.pause();

    }

});


/* =========================================================
   POPUP
========================================================= */

const welcomeOverlay = document.getElementById("welcomeOverlay");
const closeWelcome = document.getElementById("closeWelcome");
const enterGame = document.getElementById("enterGame");

function fecharWelcome() {

    welcomeOverlay.classList.add("hidden");

    tocarMusicaMenu();

}

closeWelcome.addEventListener("click", fecharWelcome);
enterGame.addEventListener("click", fecharWelcome);


/* =========================================================
   VARIÁVEIS DO JOGO
========================================================= */

let gameRunning = false;

let score = 0;
let lives = 3;

let frameCount = 0;

let highScore =
    Number(localStorage.getItem("naveEscapeHighScore")) || 0;

highScoreText.textContent = highScore;


/* =========================================================
   POWER
========================================================= */

let powerLevel = 1;


/* =========================================================
   INVENCIBILIDADE / CHEAT
========================================================= */

window.nvGodMode = false;

window.nv = {

    true: function () {

        window.nvGodMode = true;

        console.log(
            "🛡️ NV TRUE — INVENCIBILIDADE ATIVADA"
        );

    },

    false: function () {

        window.nvGodMode = false;

        console.log(
            "⚠️ NV FALSE — INVENCIBILIDADE DESATIVADA"
        );

    }

};


/* =========================================================
   JOGADOR
========================================================= */

const player = {

    x: canvas.width / 2,

    y: canvas.height - 100,

    width: 42,

    height: 48,

    speed: 6.5,

    cooldown: 0,

    invulnerableTimer: 0

};


/* =========================================================
   TECLAS
========================================================= */

const keys = {};

window.addEventListener("keydown", (event) => {

    keys[event.key.toLowerCase()] = true;

    if (
        event.code === "Space" ||
        event.key === " "
    ) {
        event.preventDefault();
        keys.space = true;
    }

});

window.addEventListener("keyup", (event) => {

    keys[event.key.toLowerCase()] = false;

    if (
        event.code === "Space" ||
        event.key === " "
    ) {
        keys.space = false;
    }

});


/* =========================================================
   METEOROS
========================================================= */

let meteors = [];

const METEOR_MAX_SPEED = 7.5;

let meteorSpawnInterval = 38;


/*
    Quantidade base de meteoros.

    A quantidade aumenta um pouco depois de cada boss.
*/
let meteorLevel = 0;


function criarMeteor() {

    const big = Math.random() < 0.22;

    const size = big
        ? 48 + Math.random() * 20
        : 20 + Math.random() * 18;

    /*
        Meteoros ficam mais rápidos conforme a pontuação.
    */

    const speed =
        Math.min(
            2.2 +
            (score / 100) * 0.35 +
            Math.random() * 1.2,
            METEOR_MAX_SPEED
        );

    meteors.push({

        x: Math.random() * canvas.width,

        y: -size,

        size: size,

        speed: speed,

        rotation: Math.random() * Math.PI * 2,

        rotationSpeed:
            (Math.random() - 0.5) * 0.04,

        health: big ? 2 : 1,

        maxHealth: big ? 2 : 1,

        big: big

    });

}


/*
    Spawn normal.

    Depois de cada boss, a frequência aumenta
    um pouco.
*/
function spawnMeteors() {

    const interval =
        Math.max(
            38 - meteorLevel * 5,
            23
        );

    if (frameCount % interval !== 0) {
        return;
    }

    criarMeteor();

    /*
        Pequeno aumento de quantidade.
    */

    if (
        meteorLevel >= 1 &&
        Math.random() < 0.18
    ) {
        criarMeteor();
    }

    if (
        meteorLevel >= 2 &&
        Math.random() < 0.22
    ) {
        criarMeteor();
    }

    if (
        meteorLevel >= 3 &&
        Math.random() < 0.25
    ) {
        criarMeteor();
    }

}


/* =========================================================
   TIROS DO JOGADOR
========================================================= */

let bullets = [];

function shoot() {

    if (player.cooldown > 0) {
        return;
    }

    bullets.push({

        x: player.x,

        y: player.y - 25,

        width: 4,

        height: 15,

        speed: 10,

        damage: powerLevel

    });

    player.cooldown = 10;


    /*
        Som do tiro MUITO baixo.

        Criamos um novo áudio para cada tiro,
        permitindo que os disparos sejam reproduzidos
        sem depender do estado do elemento original.
    */

    if (soundEnabled) {

        const shot =
            new Audio("music/laser.mp3");

        shot.volume = 0.1;

        shot.play().catch((error) => {
            console.warn("⚠️ Não foi possível reproduzir o laser:", error);
        });

    }

}


/* =========================================================
   BOSSES
========================================================= */

const bossConfigs = [

    {
        score: 200,
        name: "BOSS I",
        health: 130,
        size: 125,
        speed: 0.85,
        projectileSpeed: 4.5,
        fireRate: 68
    },

    {
        score: 500,
        name: "BOSS II",
        health: 260,
        size: 155,
        speed: 1.0,
        projectileSpeed: 5.0,
        fireRate: 52
    },

    {
        score: 1000,
        name: "BOSS III",
        health: 430,
        size: 190,
        speed: 1.15,
        projectileSpeed: 5.7,
        fireRate: 42
    },

    {
        score: 2000,
        name: "BOSS IV — O INEVITÁVEL",
        health: 1000,
        size: 220,
        speed: 1.35,
        projectileSpeed: 6.4,
        fireRate: 27,
        shield: true
    }

];


let boss = null;

let bossProjectiles = [];

let bossCoins = [];

let defeatedBosses = 0;

let nextBossIndex = 0;


/* =========================================================
   CRIAR BOSS
========================================================= */

function spawnBoss(config, index) {

    meteors = [];

    bossProjectiles = [];

    bossCoins = [];

    boss = {

        index: index,

        name: config.name,

        x: canvas.width / 2,

        y: 150,

        size: config.size,

        health: config.health,

        maxHealth: config.health,

        speed: config.speed,

        direction: 1,

        verticalDirection: 1,

        verticalOffset: 0,

        projectileSpeed:
            config.projectileSpeed,

        fireRate:
            config.fireRate,

        fireCooldown: 40,

        shield:
            config.shield || false,

        shieldEnergy:
            config.shield ? 100 : 0,

        shieldRecharge:
            config.shield ? 0.08 : 0,

        randomShotCooldown: 75,

        hitFlash: 0

    };

    bossHud.classList.remove("hidden");

    bossNameText.textContent = boss.name;

    atualizarBossHud();

    mostrarBossWarning();

}


/* =========================================================
   AVISO
========================================================= */

function mostrarBossWarning() {

    bossWarning.classList.remove("hidden");

    setTimeout(() => {

        bossWarning.classList.add("hidden");

    }, 2200);

}


/* =========================================================
   HUD BOSS
========================================================= */

function atualizarBossHud() {

    if (!boss) {

        bossHud.classList.add("hidden");

        return;
    }

    bossNameText.textContent =
        boss.name;

    const percentage =
        Math.max(
            0,
            boss.health / boss.maxHealth
        ) * 100;

    bossBar.style.width =
        percentage + "%";

    bossHpText.textContent =
        Math.ceil(boss.health);

}


/* =========================================================
   PROJÉTIL DO BOSS
========================================================= */

function criarProjetilTeleguiado() {

    if (!boss) return;


    /*
        A direção é calculada SOMENTE neste momento.

        O projétil pega a posição atual do jogador
        e segue em linha reta depois do disparo.

        Ele NÃO acompanha o jogador.
    */

    const dx =
        player.x - boss.x;

    const dy =
        player.y - boss.y;

    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        ) || 1;

    const speed =
        boss.projectileSpeed;

    bossProjectiles.push({

        x: boss.x,

        y: boss.y + boss.size * 0.35,

        radius: 8,

        vx: (dx / distance) * speed,

        vy: (dy / distance) * speed,

        homing: false,

        life: 500,

        dangerous: true

    });

}


/* =========================================================
   PEDRINHAS ALEATÓRIAS
========================================================= */

function criarPedrinhasAleatorias() {

    if (!boss) return;

    const amount =
        boss.index === 3
            ? 7
            : 3 + boss.index;

    for (let i = 0; i < amount; i++) {

        const angle =
            Math.random() * Math.PI * 2;

        const speed =
            2.5 +
            Math.random() * 3.5 +
            boss.index * 0.5;

        bossProjectiles.push({

            x: boss.x,

            y: boss.y,

            radius:
                4 + Math.random() * 4,

            vx:
                Math.cos(angle) * speed,

            vy:
                Math.sin(angle) * speed,

            homing: false,

            life: 250,

            dangerous: false

        });

    }

}


/* =========================================================
   ATAQUE DO BOSS
========================================================= */

function bossShoot() {

    if (!boss) return;

    /*
        Pedra principal:
        segue em linha reta na direção
        da posição do jogador no disparo.
    */

    criarProjetilTeleguiado();

    /*
        Pedrinhas aleatórias.
    */

    if (Math.random() < 0.75) {

        criarPedrinhasAleatorias();

    }

}


/* =========================================================
   UPDATE BOSS
========================================================= */

function updateBoss() {

    if (!boss) return;


    /*
        Movimento horizontal.
    */

    boss.x +=
        boss.speed *
        boss.direction;


    if (
        boss.x - boss.size / 2 < 0 ||
        boss.x + boss.size / 2 > canvas.width
    ) {

        boss.direction *= -1;

    }


    /*
        Movimento vertical suave.
    */

    boss.verticalOffset +=
        0.025 * boss.verticalDirection;

    if (Math.abs(boss.verticalOffset) > 35) {

        boss.verticalDirection *= -1;

    }


    /*
        Tiro principal.
    */

    boss.fireCooldown--;

    if (boss.fireCooldown <= 0) {

        bossShoot();

        boss.fireCooldown =
            boss.fireRate +
            Math.floor(Math.random() * 10);

    }


    /*
        Boss IV lança rajadas aleatórias
        com mais frequência.
    */

    if (boss.index === 3) {

        boss.randomShotCooldown--;

        if (boss.randomShotCooldown <= 0) {

            criarPedrinhasAleatorias();

            boss.randomShotCooldown =
                35 +
                Math.floor(Math.random() * 30);

        }

    }


    /*
        Escudo do Boss IV.
    */

    if (boss.shield) {

        if (boss.shieldEnergy < 100) {

            boss.shieldEnergy +=
                boss.shieldRecharge;

        }

    }


    if (boss.hitFlash > 0) {
        boss.hitFlash--;
    }


    atualizarBossHud();

}


/* =========================================================
   DANIFICAR BOSS
========================================================= */

function damageBoss(amount) {

    if (!boss) return;


    /*
        Boss IV tem escudo.

        Enquanto o escudo estiver acima de zero,
        parte do dano é absorvido.
    */

    if (boss.shield) {

        if (boss.shieldEnergy > 0) {

            const shieldDamage =
                Math.min(
                    boss.shieldEnergy,
                    amount * 0.8
                );

            boss.shieldEnergy -=
                shieldDamage;

            amount -=
                shieldDamage * 0.35;

            if (amount < 0.1) {
                amount = 0;
            }

        }

    }


    if (amount > 0) {

        boss.health -= amount;

    }

    boss.hitFlash = 5;

    atualizarBossHud();


    if (boss.health <= 0) {

        derrotarBoss();

    }

}


/* =========================================================
   DERROTAR BOSS
========================================================= */

function derrotarBoss() {

    if (!boss) return;

    /*
        Bônus progressivo.
    */

    const bonus =
        25 *
        (defeatedBosses + 1);

    score += bonus;

    defeatedBosses++;

    /*
        Aumenta um pouco a quantidade
        de meteoros depois de cada boss.
    */

    meteorLevel++;


    boss = null;

    bossProjectiles = [];

    bossCoins = [];

    bossHud.classList.add("hidden");


    /*
        Próximo boss.
    */

    nextBossIndex++;


    /*
        Pequena explosão visual.
    */

    for (let i = 0; i < 35; i++) {

        particles.push({

            x:
                canvas.width / 2,

            y:
                canvas.height / 2,

            vx:
                (Math.random() - 0.5) * 10,

            vy:
                (Math.random() - 0.5) * 10,

            life: 60 +

                Math.random() * 50,

            size:
                2 +
                Math.random() * 5

        });

    }

}


/* =========================================================
   POWER COINS
========================================================= */

function criarPowerCoin() {

    if (!boss) return;

    bossCoins.push({

        x:
            50 +
            Math.random() *
            (canvas.width - 100),

        y:
            -20,

        radius: 11,

        speed:
            1.5 +
            Math.random() * 1.5

    });

}


function updatePowerCoins() {

    for (
        let i = bossCoins.length - 1;
        i >= 0;
        i--
    ) {

        const coin =
            bossCoins[i];

        coin.y += coin.speed;


        /*
            Colisão com jogador.
        */

        const dx =
            player.x - coin.x;

        const dy =
            player.y - coin.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (
            distance <
            player.width / 2 +
            coin.radius
        ) {

            powerLevel++;

            bossCoins.splice(i, 1);

            continue;

        }


        if (
            coin.y >
            canvas.height + 30
        ) {

            bossCoins.splice(i, 1);

        }

    }

}


/* =========================================================
   PROJÉTEIS DO BOSS
========================================================= */

function updateBossProjectiles() {

    for (
        let i = bossProjectiles.length - 1;
        i >= 0;
        i--
    ) {

        const projectile =
            bossProjectiles[i];


        /*
            Os projéteis agora seguem somente
            a velocidade/direção definida no momento
            do disparo.

            NÃO existe mais correção de trajetória.
        */

        projectile.x +=
            projectile.vx;

        projectile.y +=
            projectile.vy;

        projectile.life--;


        /*
            COLISÃO COM JOGADOR

            Os projéteis vermelhos matam
            instantaneamente.
        */

        const dx =
            player.x -
            projectile.x;

        const dy =
            player.y -
            projectile.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance <
            player.width / 2 +
            projectile.radius
        ) {

            if (
                !window.nvGodMode
            ) {

                if (projectile.dangerous) {

                    /*
                        Morte instantânea.
                    */

                    lives = 0;

                    atualizarHUD();

                    gameOver();

                    return;

                } else {

                    loseLife();

                }

            }

            bossProjectiles.splice(i, 1);

            continue;

        }


        /*
            Remover fora da tela.
        */

        if (
            projectile.x <
                -50 ||
            projectile.x >
                canvas.width + 50 ||
            projectile.y <
                -50 ||
            projectile.y >
                canvas.height + 50 ||
            projectile.life <= 0
        ) {

            bossProjectiles.splice(i, 1);

        }

    }

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

        const meteor =
            meteors[i];

        meteor.y += meteor.speed;

        meteor.rotation +=
            meteor.rotationSpeed;


        /*
            Colisão com jogador.
        */

        const dx =
            player.x -
            meteor.x;

        const dy =
            player.y -
            meteor.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance <
            meteor.size / 2 +
            player.width / 2
        ) {

            if (
                !window.nvGodMode
            ) {

                loseLife();

            }

            meteors.splice(i, 1);

            continue;

        }


        if (
            meteor.y >
            canvas.height +
            meteor.size
        ) {

            meteors.splice(i, 1);

        }

    }

}


/* =========================================================
   UPDATE TIROS
========================================================= */

function updateBullets() {

    for (
        let i = bullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet =
            bullets[i];

        bullet.y -= bullet.speed;


        /*
            Colisão com boss.
        */

        if (boss) {

            const dx =
                bullet.x -
                boss.x;

            const dy =
                bullet.y -
                boss.y;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );

            if (
                distance <
                boss.size / 2
            ) {

                damageBoss(
                    bullet.damage
                );

                bullets.splice(i, 1);

                continue;

            }

        }


        /*
            Colisão com meteoros.
        */

        let hitMeteor = false;

        for (
            let m = meteors.length - 1;
            m >= 0;
            m--
        ) {

            const meteor =
                meteors[m];

            const dx =
                bullet.x -
                meteor.x;

            const dy =
                bullet.y -
                meteor.y;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                distance <
                meteor.size / 2
            ) {

                meteor.health -= 1;

                bullets.splice(i, 1);

                hitMeteor = true;


                if (
                    meteor.health <= 0
                ) {

                    score +=
                        meteor.big
                            ? 6
                            : 3;


                    /*
                        Partículas.
                    */

                    for (
                        let p = 0;
                        p < 8;
                        p++
                    ) {

                        particles.push({

                            x: meteor.x,

                            y: meteor.y,

                            vx:
                                (Math.random() - 0.5) * 4,

                            vy:
                                (Math.random() - 0.5) * 4,

                            life:
                                30 +
                                Math.random() * 25,

                            size:
                                2 +
                                Math.random() * 3

                        });

                    }


                    meteors.splice(
                        m,
                        1
                    );

                }

                break;

            }

        }


        if (
            !hitMeteor &&
            bullet.y < -30
        ) {

            bullets.splice(i, 1);

        }

    }

}


/* =========================================================
   JOGADOR UPDATE
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


    /*
        Limites.
    */

    const half =
        player.width / 2;

    if (player.x < half) {

        player.x = half;

    }

    if (
        player.x >
        canvas.width - half
    ) {

        player.x =
            canvas.width - half;

    }


    /*
        Atirar.
    */

    if (keys.space) {

        shoot();

    }


    if (
        player.cooldown > 0
    ) {

        player.cooldown--;

    }


    if (
        player.invulnerableTimer > 0
    ) {

        player.invulnerableTimer--;

    }

}


/* =========================================================
   PERDER VIDA
========================================================= */

function loseLife() {

    if (
        window.nvGodMode
    ) {

        return;

    }


    if (
        player.invulnerableTimer > 0
    ) {

        return;

    }


    lives--;

    player.invulnerableTimer =
        90;

    atualizarHUD();


    if (lives <= 0) {

        gameOver();

    }

}


/* =========================================================
   GAME OVER
========================================================= */

function gameOver() {

    gameRunning = false;

    pararMusicas();

    game.classList.add("hidden");

    gameOverScreen.classList.remove("hidden");

    finalScoreText.textContent =
        score;


    if (
        score > highScore
    ) {

        highScore = score;

        localStorage.setItem(
            "naveEscapeHighScore",
            highScore
        );

    }


    finalHighScoreText.textContent =
        highScore;

    highScoreText.textContent =
        highScore;

}


/* =========================================================
   BOSS SPAWN CHECK
========================================================= */

function checkBossSpawn() {

    if (boss) return;

    if (
        nextBossIndex >=
        bossConfigs.length
    ) {
        return;
    }


    const config =
        bossConfigs[nextBossIndex];


    if (
        score >= config.score
    ) {

        spawnBoss(
            config,
            nextBossIndex
        );

    }

}


/* =========================================================
   SCORE
========================================================= */

function updateScore() {

    /*
        Score continua subindo
        durante bosses.
    */

    if (
        frameCount % 60 === 0
    ) {

        score++;

    }

}


/* =========================================================
   ESTRELAS
========================================================= */

let stars = [];

function createStars() {

    stars = [];

    const amount =
        Math.floor(
            canvas.width *
            canvas.height /
            7000
        );

    for (
        let i = 0;
        i < amount;
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
                Math.random() * 2,

            speed:
                0.3 +
                Math.random() * 1.2

        });

    }

}

createStars();

window.addEventListener(
    "resize",
    createStars
);


function updateStars() {

    for (
        const star of stars
    ) {

        star.y += star.speed;

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


/* =========================================================
   PARTÍCULAS
========================================================= */

let particles = [];

function updateParticles() {

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const particle =
            particles[i];

        particle.x +=
            particle.vx;

        particle.y +=
            particle.vy;

        particle.life--;

        if (
            particle.life <= 0
        ) {

            particles.splice(i, 1);

        }

    }

}


/* =========================================================
   DESENHO DAS ESTRELAS
========================================================= */

function drawStars() {

    ctx.fillStyle = "#ffffff";

    for (
        const star of stars
    ) {

        ctx.globalAlpha =
            0.3 +
            Math.random() * 0.5;

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
   DESENHO DO JOGADOR
========================================================= */

function drawPlayer() {

    if (
        player.invulnerableTimer > 0 &&
        Math.floor(
            player.invulnerableTimer / 5
        ) % 2 === 0
    ) {

        return;

    }


    ctx.save();

    ctx.translate(
        player.x,
        player.y
    );


    /*
        Corpo.
    */

    ctx.fillStyle = "#00eaff";

    ctx.beginPath();

    ctx.moveTo(
        0,
        -player.height / 2
    );

    ctx.lineTo(
        player.width / 2,
        player.height / 2
    );

    ctx.lineTo(
        0,
        player.height / 3
    );

    ctx.lineTo(
        -player.width / 2,
        player.height / 2
    );

    ctx.closePath();

    ctx.fill();


    /*
        Cockpit.
    */

    ctx.fillStyle = "#071522";

    ctx.beginPath();

    ctx.arc(
        0,
        -5,
        7,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
        Chama.
    */

    ctx.fillStyle = "#ff7b00";

    ctx.beginPath();

    ctx.moveTo(
        -7,
        20
    );

    ctx.lineTo(
        0,
        35 +
        Math.random() * 8
    );

    ctx.lineTo(
        7,
        20
    );

    ctx.closePath();

    ctx.fill();

    ctx.restore();

}


/* =========================================================
   DESENHO METEOROS
========================================================= */

function drawMeteors() {

    for (
        const meteor of meteors
    ) {

        ctx.save();

        ctx.translate(
            meteor.x,
            meteor.y
        );

        ctx.rotate(
            meteor.rotation
        );


        /*
            GRANDES = VERMELHO/ROXO
            PEQUENOS = CINZA
        */

        if (meteor.big) {

            ctx.fillStyle = "#8e273c";

            ctx.strokeStyle = "#ff4b5c";

            ctx.shadowColor =
                "#ff304f";

            ctx.shadowBlur = 10;

        } else {

            ctx.fillStyle = "#6d7480";

            ctx.strokeStyle = "#aeb8c4";

            ctx.shadowColor =
                "transparent";

            ctx.shadowBlur = 0;

        }


        ctx.lineWidth = 2;

        ctx.beginPath();


        const points = 8;

        for (
            let i = 0;
            i < points;
            i++
        ) {

            const angle =
                (Math.PI * 2 / points) *
                i;

            const variation =
                0.75 +
                Math.random() *
                0.25;

            const radius =
                (meteor.size / 2) *
                variation;

            const x =
                Math.cos(angle) *
                radius;

            const y =
                Math.sin(angle) *
                radius;


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

        ctx.stroke();


        /*
            Marcas nos meteoros grandes.
        */

        if (meteor.big) {

            ctx.strokeStyle =
                "rgba(255,180,180,0.5)";

            ctx.lineWidth = 2;

            ctx.beginPath();

            ctx.moveTo(
                -meteor.size * 0.18,
                -meteor.size * 0.1
            );

            ctx.lineTo(
                meteor.size * 0.1,
                meteor.size * 0.18
            );

            ctx.stroke();

        }


        ctx.restore();

    }

}


/* =========================================================
   DESENHO BOSS
========================================================= */

function drawBoss() {

    if (!boss) return;

    ctx.save();

    ctx.translate(
        boss.x,
        boss.y +
        boss.verticalOffset
    );


    /*
        Escudo.
    */

    if (
        boss.shield &&
        boss.shieldEnergy > 0
    ) {

        ctx.strokeStyle =
            "rgba(0, 234, 255, 0.75)";

        ctx.lineWidth = 5;

        ctx.shadowColor =
            "#00eaff";

        ctx.shadowBlur = 25;

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            boss.size * 0.68,
            0,
            Math.PI * 2
        );

        ctx.stroke();

    }


    /*
        Corpo principal.
    */

    ctx.shadowColor =
        "#ff2020";

    ctx.shadowBlur = 20;

    ctx.fillStyle =
        boss.hitFlash > 0
            ? "#ffffff"
            : "#3b0505";

    ctx.strokeStyle =
        "#ff3030";

    ctx.lineWidth = 4;


    ctx.beginPath();

    ctx.moveTo(
        0,
        -boss.size / 2
    );

    ctx.lineTo(
        boss.size / 2,
        boss.size / 4
    );

    ctx.lineTo(
        boss.size * 0.28,
        boss.size / 2
    );

    ctx.lineTo(
        0,
        boss.size * 0.32
    );

    ctx.lineTo(
        -boss.size * 0.28,
        boss.size / 2
    );

    ctx.lineTo(
        -boss.size / 2,
        boss.size / 4
    );

    ctx.closePath();

    ctx.fill();

    ctx.stroke();


    /*
        Núcleo.
    */

    ctx.fillStyle =
        boss.index === 3
            ? "#00eaff"
            : "#ff3030";

    ctx.shadowColor =
        boss.index === 3
            ? "#00eaff"
            : "#ff0000";

    ctx.shadowBlur = 25;

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        boss.size * 0.15,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
        Boss IV tem núcleos laterais.
    */

    if (
        boss.index === 3
    ) {

        ctx.fillStyle =
            "#ff8c00";

        ctx.shadowColor =
            "#ff8c00";

        ctx.beginPath();

        ctx.arc(
            -boss.size * 0.28,
            0,
            boss.size * 0.07,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.beginPath();

        ctx.arc(
            boss.size * 0.28,
            0,
            boss.size * 0.07,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }


    ctx.restore();

}


/* =========================================================
   DESENHO PROJÉTEIS BOSS
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

        /*
            Vermelhos:
            maiores e perigosos.

            Cinzas:
            pedrinhas aleatórias.
        */

        if (
            projectile.dangerous
        ) {

            ctx.fillStyle =
                "#ff3030";

            ctx.strokeStyle =
                "#ffaaaa";

            ctx.shadowColor =
                "#ff0000";

            ctx.shadowBlur = 15;

        } else {

            ctx.fillStyle =
                "#a0a0a0";

            ctx.strokeStyle =
                "#e0e0e0";

            ctx.shadowColor =
                "#ffffff";

            ctx.shadowBlur = 5;

        }


        ctx.beginPath();

        ctx.arc(
            0,
            0,
            projectile.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.stroke();

        ctx.restore();

    }

}


/* =========================================================
   DESENHO POWER COINS
========================================================= */

function drawPowerCoins() {

    for (
        const coin of bossCoins
    ) {

        ctx.save();

        ctx.translate(
            coin.x,
            coin.y
        );

        ctx.fillStyle =
            "#ffd000";

        ctx.strokeStyle =
            "#fff5a0";

        ctx.shadowColor =
            "#ffd000";

        ctx.shadowBlur = 15;

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            coin.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.stroke();


        ctx.fillStyle =
            "#6b5100";

        ctx.font =
            "bold 12px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillText(
            "P",
            0,
            1
        );

        ctx.restore();

    }

}


/* =========================================================
   DESENHO TIROS
========================================================= */

function drawBullets() {

    for (
        const bullet of bullets
    ) {

        ctx.save();

        ctx.fillStyle =
            "#00eaff";

        ctx.shadowColor =
            "#00eaff";

        ctx.shadowBlur = 12;

        ctx.fillRect(
            bullet.x -
            bullet.width / 2,

            bullet.y,

            bullet.width,

            bullet.height
        );

        ctx.restore();

    }

}


/* =========================================================
   DESENHO PARTÍCULAS
========================================================= */

function drawParticles() {

    for (
        const particle of particles
    ) {

        ctx.fillStyle =
            "#ff9d00";

        ctx.globalAlpha =
            Math.max(
                0,
                particle.life / 80
            );

        ctx.fillRect(
            particle.x,
            particle.y,
            particle.size,
            particle.size
        );

    }

    ctx.globalAlpha = 1;

}


/* =========================================================
   HUD
========================================================= */

function atualizarHUD() {

    scoreText.textContent =
        score;

    livesText.textContent =
        lives;

    highScoreText.textContent =
        highScore;

    powerText.textContent =
        powerLevel;

}


/* =========================================================
   RESET GAME
========================================================= */

function resetGame() {

    score = 0;

    lives = 3;

    powerLevel = 1;

    frameCount = 0;

    meteorLevel = 0;

    defeatedBosses = 0;

    nextBossIndex = 0;

    boss = null;

    meteors = [];

    bullets = [];

    bossProjectiles = [];

    bossCoins = [];

    particles = [];

    player.x =
        canvas.width / 2;

    player.y =
        canvas.height - 100;

    player.cooldown = 0;

    player.invulnerableTimer = 0;

    bossHud.classList.add("hidden");

    bossWarning.classList.add("hidden");

    atualizarHUD();

}


/* =========================================================
   INICIAR JOGO
========================================================= */

function startGame() {

    resetGame();

    menu.classList.add("hidden");

    gameOverScreen.classList.add("hidden");

    game.classList.remove("hidden");

    gameRunning = true;

    tocarMusicaJogo();

    requestAnimationFrame(gameLoop);

}


/* =========================================================
   MENU
========================================================= */

function voltarMenu() {

    gameRunning = false;

    pararMusicas();

    game.classList.add("hidden");

    gameOverScreen.classList.add("hidden");

    menu.classList.remove("hidden");

    tocarMusicaMenu();

}


/* =========================================================
   EVENTOS
========================================================= */

startBtn.addEventListener(
    "click",
    startGame
);

restartBtn.addEventListener(
    "click",
    startGame
);

menuBtn.addEventListener(
    "click",
    voltarMenu
);


/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop() {

    if (!gameRunning) {
        return;
    }

    frameCount++;


    /* =====================
       UPDATE
    ===================== */

    updateStars();

    updatePlayer();

    /*
        Meteoros só aparecem
        quando não existe boss.
    */

    if (!boss) {

        spawnMeteors();

    }

    updateMeteors();

    updateBullets();

    updateBoss();

    updateBossProjectiles();

    updatePowerCoins();

    updateParticles();

    updateScore();

    checkBossSpawn();


    /*
        Power coin:
        aparece ocasionalmente durante
        bosses.
    */

    if (
        boss &&
        frameCount % 420 === 0 &&
        Math.random() < 0.55
    ) {

        criarPowerCoin();

    }


    /* =====================
       DRAW
    ===================== */

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.fillStyle = "#000";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawStars();

    drawMeteors();

    drawPowerCoins();

    drawBossProjectiles();

    drawBoss();

    drawBullets();

    drawParticles();

    drawPlayer();


    /* =====================
       HUD
    ===================== */

    atualizarHUD();


    requestAnimationFrame(
        gameLoop
    );

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

atualizarHUD();

tocarMusicaMenu();

console.log(
    "🚀 System of Burla carregado."
);

console.log(
    "🛡️ Teste de invencibilidade: nv.true() / nv.false()"
);

console.log(
    "👹 Bosses: 200 / 500 / 1000 / 2000"
);