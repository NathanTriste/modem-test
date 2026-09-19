```javascript
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


/*
    Volume da música.
*/
menuMusic.volume = 0.40;
gameMusic.volume = 0.40;


/*
    Laser propositalmente baixo.
*/
laserSound.volume = 0.055;


const soundBtn = document.getElementById("soundBtn");


/*
    Música do MENU
*/
function tocarMusicaMenu() {

    if (!soundEnabled) return;

    gameMusic.pause();

    /*
        Garante que o menu continue do ponto
        em que estava.
    */
    menuMusic.volume = 0.40;

    menuMusic.play().catch((erro) => {
        console.log(
            "⚠️ Música do menu bloqueada:",
            erro
        );
    });

}


/*
    Música DO JOGO

    Corrigido para garantir que o áudio
    seja iniciado quando o jogo começa.
*/
function tocarMusicaJogo() {

    if (!soundEnabled) return;

    menuMusic.pause();

    /*
        Garante volume correto.
    */
    gameMusic.volume = 0.40;

    /*
        Começa do início toda vez que
        uma nova partida começa.
    */
    gameMusic.currentTime = 0;

    const promessa = gameMusic.play();

    if (promessa !== undefined) {

        promessa
            .then(() => {

                console.log(
                    "🎵 Música do jogo iniciada!"
                );

            })
            .catch((erro) => {

                console.log(
                    "⚠️ Música do jogo bloqueada:",
                    erro
                );

            });

    }

}


/*
    Para todas as músicas.
*/
function pararMusicas() {

    menuMusic.pause();
    gameMusic.pause();

}


/*
    BOTÃO DE SOM
*/
soundBtn.addEventListener("click", () => {

    soundEnabled = !soundEnabled;

    if (soundEnabled) {

        soundBtn.textContent = "🔊";

        if (
            !game.classList.contains("hidden")
        ) {

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

const welcomeOverlay =
    document.getElementById("welcomeOverlay");

const closeWelcome =
    document.getElementById("closeWelcome");

const enterGame =
    document.getElementById("enterGame");


function fecharWelcome() {

    welcomeOverlay.classList.add("hidden");

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
   VARIÁVEIS DO JOGO
========================================================= */

let gameRunning = false;

let score = 0;
let lives = 3;

let frameCount = 0;

let highScore =
    Number(
        localStorage.getItem(
            "naveEscapeHighScore"
        )
    ) || 0;

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

let meteorLevel = 0;


function criarMeteor() {

    const big =
        Math.random() < 0.22;

    const size =
        big
            ? 48 + Math.random() * 20
            : 20 + Math.random() * 18;

    const speed =
        Math.min(
            2.2 +
            (score / 100) * 0.35 +
            Math.random() * 1.2,
            METEOR_MAX_SPEED
        );

    meteors.push({

        x:
            Math.random() *
            canvas.width,

        y:
            -size,

        size:
            size,

        speed:
            speed,

        rotation:
            Math.random() *
            Math.PI * 2,

        rotationSpeed:
            (Math.random() - 0.5) *
            0.04,

        health:
            big ? 2 : 1,

        maxHealth:
            big ? 2 : 1,

        big:
            big

    });

}


function spawnMeteors() {

    const interval =
        Math.max(
            38 -
            meteorLevel * 5,
            23
        );

    if (
        frameCount % interval !== 0
    ) {

        return;

    }

    criarMeteor();

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

    if (
        player.cooldown > 0
    ) {

        return;

    }

    bullets.push({

        x:
            player.x,

        y:
            player.y - 25,

        width:
            4,

        height:
            15,

        speed:
            10,

        damage:
            powerLevel

    });

    player.cooldown = 10;


    /*
        SOM DO LASER

        Mantido baixo, mas agora o objeto
        é recriado corretamente para permitir
        vários tiros rápidos.
    */

    if (soundEnabled) {

        const shot =
            laserSound.cloneNode(true);

        shot.volume = 0.055;

        shot.currentTime = 0;

        shot.play().catch(() => {});

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

        index:
            index,

        name:
            config.name,

        x:
            canvas.width / 2,

        y:
            150,

        size:
            config.size,

        health:
            config.health,

        maxHealth:
            config.health,

        speed:
            config.speed,

        direction:
            1,

        verticalDirection:
            1,

        verticalOffset:
            0,

        projectileSpeed:
            config.projectileSpeed,

        fireRate:
            config.fireRate,

        fireCooldown:
            40,

        shield:
            config.shield || false,

        shieldEnergy:
            config.shield
                ? 100
                : 0,

        shieldRecharge:
            config.shield
                ? 0.08
                : 0,

        randomShotCooldown:
            75,

        hitFlash:
            0

    };

    bossHud.classList.remove(
        "hidden"
    );

    bossNameText.textContent =
        boss.name;

    atualizarBossHud();

    mostrarBossWarning();

}


/* =========================================================
   AVISO
========================================================= */

function mostrarBossWarning() {

    bossWarning.classList.remove(
        "hidden"
    );

    setTimeout(() => {

        bossWarning.classList.add(
            "hidden"
        );

    }, 2200);

}


/* =========================================================
   HUD BOSS
========================================================= */

function atualizarBossHud() {

    if (!boss) {

        bossHud.classList.add(
            "hidden"
        );

        return;

    }

    bossNameText.textContent =
        boss.name;

    const percentage =
        Math.max(
            0,
            boss.health /
            boss.maxHealth
        ) * 100;

    bossBar.style.width =
        percentage + "%";

    bossHpText.textContent =
        Math.ceil(
            boss.health
        );

}


/* =========================================================
   PROJÉTIL NA DIREÇÃO DO PLAYER
========================================================= */

function criarProjetilTeleguiado() {

    if (!boss) return;


    /*
        IMPORTANTE:

        A posição do jogador é capturada
        SOMENTE neste momento.

        Depois que a pedra sair,
        ela NÃO acompanha mais o jogador.
    */

    const targetX =
        player.x;

    const targetY =
        player.y;


    const dx =
        targetX -
        boss.x;

    const dy =
        targetY -
        boss.y;

    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        ) || 1;

    const speed =
        boss.projectileSpeed;


    bossProjectiles.push({

        x:
            boss.x,

        y:
            boss.y +
            boss.size * 0.35,

        radius:
            8,

        /*
            Direção calculada UMA VEZ.
        */

        vx:
            (dx / distance) *
            speed,

        vy:
            (dy / distance) *
            speed,

        /*
            Mantém essa propriedade para
            identificar a pedra vermelha.
        */
        homing:
            false,

        life:
            500,

        dangerous:
            true

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
            : 3 +
              boss.index;

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        const angle =
            Math.random() *
            Math.PI * 2;

        const speed =
            2.5 +
            Math.random() * 3.5 +
            boss.index * 0.5;

        bossProjectiles.push({

            x:
                boss.x,

            y:
                boss.y,

            radius:
                4 +
                Math.random() * 4,

            vx:
                Math.cos(angle) *
                speed,

            vy:
                Math.sin(angle) *
                speed,

            homing:
                false,

            life:
                250,

            dangerous:
                false

        });

    }

}


/* =========================================================
   ATAQUE DO BOSS
========================================================= */

function bossShoot() {

    if (!boss) return;


    /*
        Pedra vermelha:
        vai diretamente para onde
        o jogador estava.
    */

    criarProjetilTeleguiado();


    /*
        Pedrinhas aleatórias.
    */

    if (
        Math.random() < 0.75
    ) {

        criarPedrinhasAleatorias();

    }

}


/* =========================================================
   UPDATE BOSS
========================================================= */

function updateBoss() {

    if (!boss) return;


    boss.x +=
        boss.speed *
        boss.direction;


    if (
        boss.x -
        boss.size / 2 < 0 ||

        boss.x +
        boss.size / 2 >
        canvas.width
    ) {

        boss.direction *= -1;

    }


    boss.verticalOffset +=
        0.025 *
        boss.verticalDirection;


    if (
        Math.abs(
            boss.verticalOffset
        ) > 35
    ) {

        boss.verticalDirection *= -1;

    }


    boss.fireCooldown--;

    if (
        boss.fireCooldown <= 0
    ) {

        bossShoot();

        boss.fireCooldown =
            boss.fireRate +
            Math.floor(
                Math.random() * 10
            );

    }


    if (
        boss.index === 3
    ) {

        boss.randomShotCooldown--;

        if (
            boss.randomShotCooldown <= 0
        ) {

            criarPedrinhasAleatorias();

            boss.randomShotCooldown =
                35 +
                Math.floor(
                    Math.random() * 30
                );

        }

    }


    if (boss.shield) {

        if (
            boss.shieldEnergy < 100
        ) {

            boss.shieldEnergy +=
                boss.shieldRecharge;

        }

    }


    if (
        boss.hitFlash > 0
    ) {

        boss.hitFlash--;

    }


    atualizarBossHud();

}


/* =========================================================
   DANIFICAR BOSS
========================================================= */

function damageBoss(amount) {

    if (!boss) return;


    if (
        boss.shield
    ) {

        if (
            boss.shieldEnergy > 0
        ) {

            const shieldDamage =
                Math.min(
                    boss.shieldEnergy,
                    amount * 0.8
                );

            boss.shieldEnergy -=
                shieldDamage;

            amount -=
                shieldDamage * 0.35;

            if (
                amount < 0.1
            ) {

                amount = 0;

            }

        }

    }


    if (
        amount > 0
    ) {

        boss.health -=
            amount;

    }


    boss.hitFlash = 5;

    atualizarBossHud();


    if (
        boss.health <= 0
    ) {

        derrotarBoss();

    }

}


/* =========================================================
   DERROTAR BOSS
========================================================= */

function derrotarBoss() {

    if (!boss) return;

    const bonus =
        25 *
        (defeatedBosses + 1);

    score +=
        bonus;

    defeatedBosses++;

    meteorLevel++;

    boss = null;

    bossProjectiles = [];

    bossCoins = [];

    bossHud.classList.add(
        "hidden"
    );

    nextBossIndex++;


    for (
        let i = 0;
        i < 35;
        i++
    ) {

        particles.push({

            x:
                canvas.width / 2,

            y:
                canvas.height / 2,

            vx:
                (Math.random() - 0.5) *
                10,

            vy:
                (Math.random() - 0.5) *
                10,

            life:
                60 +
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

        radius:
            11,

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

        coin.y +=
            coin.speed;


        const dx =
            player.x -
            coin.x;

        const dy =
            player.y -
            coin.y;

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

            bossCoins.splice(
                i,
                1
            );

            continue;

        }


        if (
            coin.y >
            canvas.height + 30
        ) {

            bossCoins.splice(
                i,
                1
            );

        }

    }

}


/* =========================================================
   PROJÉTEIS DO BOSS
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


        /*
            IMPORTANTE:

            NÃO existe mais correção de
            trajetória aqui.

            As pedras simplesmente seguem
            o vx/vy que receberam quando
            foram criadas.
        */

        projectile.x +=
            projectile.vx;

        projectile.y +=
            projectile.vy;

        projectile.life--;


        /*
            Colisão com jogador.
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

                if (
                    projectile.dangerous
                ) {

                    /*
                        Pedra vermelha:
                        morte instantânea.
                    */

                    lives = 0;

                    atualizarHUD();

                    gameOver();

                    return;

                } else {

                    loseLife();

                }

            }

            bossProjectiles.splice(
                i,
                1
            );

            continue;

        }


        if (
            projectile.x < -50 ||
            projectile.x >
                canvas.width + 50 ||
            projectile.y < -50 ||
            projectile.y >
                canvas.height + 50 ||
            projectile.life <= 0
        ) {

            bossProjectiles.splice(
                i,
                1
            );

        }

    }

}


/* =========================================================
   METEOROS
========================================================= */

function updateMeteors() {

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

            meteors.splice(
                i,
                1
            );

            continue;

        }


        if (
            meteor.y >
            canvas.height +
            meteor.size
        ) {

            meteors.splice(
                i,
                1
            );

        }

    }

}


/* =========================================================
   UPDATE TIROS
========================================================= */

function updateBullets() {

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

                bullets.splice(
                    i,
                    1
                );

                continue;

            }

        }


        let hitMeteor = false;


        for (
            let m =
                meteors.length - 1;
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

                meteor.health--;

                bullets.splice(
                    i,
                    1
                );

                hitMeteor = true;


                if (
                    meteor.health <= 0
                ) {

                    score +=
                        meteor.big
                            ? 6
                            : 3;


                    for (
                        let p = 0;
                        p < 8;
                        p++
                    ) {

                        particles.push({

                            x:
                                meteor.x,

                            y:
                                meteor.y,

                            vx:
                                (Math.random() -
                                    0.5) * 4,

                            vy:
                                (Math.random() -
                                    0.5) * 4,

                            life:
                                30 +
                                Math.random() *
                                25,

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

            bullets.splice(
                i,
                1
            );

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


    const half =
        player.width / 2;

    if (
        player.x < half
    ) {

        player.x = half;

    }

    if (
        player.x >
        canvas.width - half
    ) {

        player.x =
            canvas.width - half;

    }


    if (keys.space) {

        shoot();

    }


    if (
```
