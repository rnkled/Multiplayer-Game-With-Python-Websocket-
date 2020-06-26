class Bullet {

    constructor(px, py, xSpd, ySpd) {
        this.pos = createVector(px, py);
        this.xSpd = 7 * xSpd;
        this.ySpd = 7 * ySpd;
    }

    show() {
        push()
        fill(255);
        stroke(255);
        ellipse(this.pos.x, this.pos.y, 4);
        this.move();
        pop();
    }

    move() {
        this.pos.x += this.xSpd;
        this.pos.y += this.ySpd;
        this.xSpd *= 0.998;
        this.ySpd *= 0.998;
    }

    exile() {
        this.pos.x = 15000;
        this.pos.y = 15000;
    }

    arenaCollision(arena) {
        arena.forEach(element => {
            //console.log(element)
            if (collidePointPoly(this.pos.x, this.pos.y, element)) {
                this.exile();
            }
        });
    }

    report() {
        return `{"x":${this.pos.x}, "y":${this.pos.y}, "xSpd":${this.xSpd}, "ySpd":${this.ySpd}}`
    }
}