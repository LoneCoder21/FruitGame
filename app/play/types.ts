import Matter from "matter-js";

export class Fruit {
    x: number;
    y: number;
    radius: number;
    angle: number;
    color: string;
    name: string;
    score: number;
    image: HTMLImageElement;
    body: Matter.Body;

    constructor(x: number, y: number, radius: number, color: string, name: string, score: number) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.name = name;
        this.score = score;
        this.image = new Image();
        this.image.src = `/${name}.png`;
        this.body = Matter.Bodies.circle(x, y, radius, { label: name, restitution: 0.1, angularSpeed: 1.0 });
        this.angle = this.body.angle;
    }

    clone() {
        return new Fruit(this.x, this.y, this.radius, this.color, this.name, this.score);
    }

    update() {
        this.x = this.body.position.x;
        this.y = this.body.position.y;
        this.angle = this.body.angle;
    }

    setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
        Matter.Body.setPosition(this.body, Matter.Vector.create(this.x, this.y));
    }

    getBody() {
        return this.body;
    }
}

export class Wall {
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;
    body: Matter.Body;

    constructor(x: number, y: number, width: number, height: number, name = "wall", isSensor = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.name = name;
        this.body = Matter.Bodies.rectangle(x + width / 2, y + height / 2, width, height, {
            label: name,
            isStatic: true,
            isSensor
        });
    }

    update() {
        this.x = this.body.position.x - this.width / 2;
        this.y = this.body.position.y - this.height / 2;
    }

    getBody() {
        return this.body;
    }
}

export type RectangleSize = {
    width: number;
    height: number;
};
