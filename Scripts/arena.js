class Arena {
    constructor(base = []) {
        this.base = base;
        this.amount = 12;
        this.barriers = [];
        this.mount();
    }

    mount() {
        if (this.base.length > 0) {
            for (let c = 0; c < this.base.length; c++) {
                this.barriers.push(new Barrier(this.base[c]));
            }
        } else {
            for (let c = 0; c < this.amount; c++) {
                this.barriers.push(new Barrier());
            }
        }
    }

    show() {
        this.barriers.forEach(element => {
            element.show();
        })
    }

    report() {
        let vertexArray = [];
        this.barriers.forEach(
            element => {
                vertexArray.push(element.vertexes);
            }
        )
        return vertexArray;
    }

    reportToSend() {
        let vertexArray = [];
        this.barriers.forEach(
            element => {
                vertexArray.push(element.report());
            }
        )
        return vertexArray;
    }

    setArena(newArena) {
        let vertexes = [];
        newArena.forEach(vertex => {
            let futurep5 = [];
            vertex.forEach(vector => {
                let vectorParsed = JSON.parse(vector.slice(19));
                futurep5.push(createVector(vectorParsed[0], vectorParsed[1]));
            })
            vertexes.push(futurep5);
        })
        this.barriers = [];
        vertexes.forEach(element => {
            this.barriers.push(new Barrier(element));
        })
    }

    reset() {
        this.barriers = [];
    }
}


class Barrier {
    constructor(vertexes = []) {
        let borderDistance = 100;
        this.pos = createVector(random(borderDistance, width - borderDistance), random(borderDistance, height - borderDistance));
        this.r = random(20, 100);
        this.offset = [];
        this.sides = random(4, 12);
        for (var i = 0; i < this.sides; i++) {
            this.offset[i] = random(-this.r * 0.5, this.r * 0.5);
        }
        this.vertexes = vertexes;
        if (vertexes.length == 0) {
            this.start();
        }
    }

    start() {
        translate(this.pos.x, this.pos.y);
        for (var i = 0; i < this.sides; i++) {
            let angle = map(i, 0, this.sides, 0, TWO_PI);
            let r = this.r + this.offset[i];
            let x = r * cos(angle);
            let y = r * sin(angle);
            this.vertexes.push(createVector(x + this.pos.x, y + this.pos.y));
        }
    }

    show() {
        push();
        noStroke();
        fill(128, 1, 3, 100);
        beginShape();
        this.vertexes.forEach(v => {
            vertex(v.x, v.y)
        })
        endShape(CLOSE);
        pop();
    }

    report() {
        let array = [];
        this.vertexes.forEach(element => {
            array.push(element.toString());
        })
        return array
    }
}