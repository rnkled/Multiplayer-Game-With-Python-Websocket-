class Player {

    constructor(x, y, name, hp = 1000) {
        //Atributes
        this.id = 0;
        this.pos = createVector(x, y);
        this.size = 25;
        this.speed = 4;
        this.friction = 0.97;
        this.acceleration = createVector(0, 0);
        this.hp = hp;
        this.name = name;
        this.score = 0;

        //controles
        this.up = 0;
        this.down = 0;
        this.left = 0;
        this.right = 0;

        //features
        this.weapon = true;
        this.bullet = 0;
    }

    show() {
        push()
        fill(0);
        stroke(255);
        ellipse(this.pos.x, this.pos.y, this.size, this.size);
        this.showHP();
        pop();
        this.move();
    }

    showHP() {
        let barheight = 2;
        let barwidth = this.size + 10;
        let barfill = map(this.hp, 0, 1000, 0, barwidth);
        let barx = this.pos.x - (this.size / 2) - 5;
        let bary = this.pos.y - this.size / 1.4;
        strokeWeight(0.5);
        rect(barx, bary, barwidth, barheight);
        fill(255);
        rect(barx, bary, barfill, barheight);
        textAlign(CENTER);
        if (this.name) {
            text(this.name, this.pos.x, bary - 8);
        } else {
            text(this.id, this.pos.x, bary - 8);
        }
    }

    move() {
        this.acceleration.x += this.speed * (this.right - this.left) / 10;
        this.acceleration.y += this.speed * (this.down - this.up) / 10;
        this.acceleration.mult(this.friction);
        this.constrainVector(this.acceleration);
        this.check(this.pos);
        this.pos.add(this.acceleration);
    }

    constrainVector(vector) {
        if (abs(vector.x) < 0.1) {
            vector.x = 0
        }
        if (abs(vector.y) < 0.1) {
            vector.y = 0
        }
    }

    check(pos) {
        if (pos.x > width && this.hp > 0) {
            this.pos.x = width;
            this.acceleration.x *= -1;
        };
        if (pos.x < 0 && this.hp > 0) {
            this.pos.x = 0
            this.acceleration.x *= -1;
        };
        if (pos.y > height && this.hp > 0) {
            this.pos.y = height;
            this.acceleration.y *= -1;
        };
        if (pos.y < 0 && this.hp > 0) {
            this.pos.y = 0;
            this.acceleration.y *= -1;
        };

        if (this.hp <= 0) {
            this.pos.x = 10000;
            this.pos.y = 10000;
        }
    }

    arenaCollision(arena) {
        arena.forEach(element => {
            if (collideCirclePoly(this.pos.x, this.pos.y, this.size, element, true)) {
                this.hp -= 3;

                //Alert
                push()
                stroke(0);
                fill(255, 0, 0);
                textAlign(CENTER);
                textSize(60);
                text('DANGER ZONE', width / 2, height / 6, )
                textSize(20);
                text('Loosing hp !!! Get Out !!!', width / 2, height / 5);
                fill(255);
                ellipse(this.pos.x, this.pos.y, this.size + map(this.hp, 0, 1000, 0, 15));
                pop();
            }
        });
    }

    shot() {
        let mouseXalt = mouseX - this.pos.x;
        let mouseYalt = mouseY - this.pos.y;
        let mouseDir = createVector(mouseXalt, mouseYalt);
        mouseDir.normalize();
        let bullet = new Bullet(this.pos.x, this.pos.y, mouseDir.x, mouseDir.y);
        return bullet;
    }

    report() {
        let name;
        if (this.name) {
            name = this.name;
        } else {
            name = this.id;
        }
        return `{"x":${this.pos.x}, "y":${this.pos.y}, "hp":${this.hp}, "s":${this.size}, "name":"${name}", "Score":${this.score}}`
    }

    reset() {
        this.hp = 1000;
        this.pos = createVector(random(0, width), random(0, height));
    }

    impact(angle) {
        this.acceleration.add(createVector(this.speed / 15, this.speed / 15).rotate(angle - 0.25));
    }
}