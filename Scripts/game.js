class Game {

    constructor(p1, arena) {
        this.arena = arena;
        this.player = p1;
        this.lenght = 1;
        this.id = 0;
        this.enemys = {};
        this.bullets = [];
        this.enemyBullets = [];
    }

    show() {
        let score = [];
        Object.entries(this.enemys).forEach((enemy => {
            this.drawEnemys(enemy[1]['x'], enemy[1]['y'], enemy[1]['hp'], enemy[1]['s'], enemy[1]['name']);
            score.push(`${enemy[1]['name']}   ${enemy[1]['Score']}`);
        }))
        this.bullets.forEach(bullet => {
            this.manageBullets(bullet);
            bullet.arenaCollision(this.arena.report());
        })
        this.enemyBullets.forEach(bullet => {
            this.manageEnemyBullets(bullet);
        })
        this.player.arenaCollision(this.arena.report());
        this.player.show();
        this.showScore(score);
        this.cleanEnemys();
    }

    setEnemys(dataRec, id) {
        Object.entries(dataRec).forEach((element => {
            if (!(element[0] == id || element[0] == 'Action' || element[0] == 'Bullets')) {
                let enemy = JSON.parse(element[1][element[0]])
                this.enemys[element[0]] = enemy;
            } else if ((element[0] == 'Bullets') && (Object.keys(element[1]).length)) {
                let bulletsArray = [];
                element[1].forEach((Elementbullet => {
                    let ObjBullet = JSON.parse(Elementbullet);
                    let bullet = new Bullet(ObjBullet.x, ObjBullet.y, ObjBullet.xSpd, ObjBullet.ySpd);
                    bulletsArray.push(bullet);
                }))
                this.enemyBullets = [];
                this.enemyBullets = bulletsArray;
            }
        }))
    }

    sendData() {
        let data;
        data = {};
        data[id] = this.player.report();
        return data;
    }

    sendBulletData() {
        let bulletData = [];
        this.bullets.forEach(bullet => {
            bulletData.push(bullet.report());
        })

        return bulletData;
    }

    setId(id) {
        this.id = id;
        this.player.id = this.id;
    }

    drawEnemys(x, y, hp = 1000, size, name) {
        push()
        fill(0);
        stroke(255);
        ellipse(x, y, size, size);

        //hp bar 
        strokeWeight(0.5);
        rect(x - size / 2 - 5, y - size / 1.5, size + 10, 2);
        fill(255);
        rect(x - size / 2 - 5, y - size / 1.5, map(hp, 0, 1000, 0, size + 10), 2);
        textAlign(CENTER);
        text(name, x, y - size / 1.5 - 10);
        pop()
    }

    addBullet(bullet) {
        this.bullets.push(bullet);
    }

    manageBullets(bullet) {
        if (bullet) {
            if ((0 < bullet.pos.x) && (bullet.pos.x < width) && (0 < bullet.pos.y) && (bullet.pos.y < width)) {
                bullet.show();
            } else {
                this.bullets.splice(this.bullets.indexOf(bullet), 1);
            }

        }
    }

    manageEnemyBullets(bullet) {
        if (bullet) {
            if ((0 < bullet.pos.x) && (bullet.pos.x < width) && (0 < bullet.pos.y) && (bullet.pos.y < width)) {
                bullet.show();
                this.checkColision(this.player, bullet)
            } else {
                this.enemyBullets = [];
            }
        }
    }
    cleanEnemys() {
        this.enemys = {};
    }

    checkColision(player, bullet) {

        if (collidePointCircle(bullet.pos.x, bullet.pos.y, player.pos.x, player.pos.y, player.size)) {
            player.hp -= 10;
            player.impact(createVector(bullet.xSpd, bullet.ySpd).heading());
        }
    }

    sendReset(socket) {
        this.arena = new Arena();
        console.log("[Client] Reseting Game");
        socket.send(JSON.stringify({
            Action: 'reset',
            Arena: this.arena.reportToSend(),
        }));
    }
    reset() {
        this.checkScore()
        this.player.reset();
        this.bullets = [];
        this.enemyBullets = [];
        console.log("[Client] Game Reseted");
    }

    setArena(arena) {
        this.arena = arena;
    }

    checkGameState() {
        if (Object.values(this.enemys).length <= 0) {
            return "Waiting"
        } else {
            let deads = 0;
            Object.values(this.enemys).forEach(element => {
                if (element.hp <= 0) {
                    deads += 1;
                }
            });
            if (deads >= Object.values(this.enemys).length) {
                return 'End'
            } else {
                return 'Running'
            }
        }

    }

    checkScore() {
        if (p1.hp > 0 && this.checkGameState() == 'End') {
            p1.score += 1;
        }
    }

    showScore(score) {
        push();
        fill(255);
        textSize(22);
        textAlign(RIGHT);
        let count = 1;
        text(`${p1.name}   ${p1.score}`, width - 25, 25);
        score.forEach(element => {
            text(element, width - 25, 25 + count * 30);
            count++;
        })
        pop();
    }
}