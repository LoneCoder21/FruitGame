import Matter from "matter-js";

export class Fruit {
    x: number;
    y: number;
    radius: number;
    color: string;
    body: Matter.Body;

    constructor(x: number, y: number, radius: number, color: string) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.body = Matter.Bodies.circle(x, y, radius);
    }

    createClone() {
        return new Fruit(this.x, this.y, this.radius, this.color);
    }

    update() {
        this.x = this.body.position.x;
        this.y = this.body.position.y;
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
    body: Matter.Body;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.body = Matter.Bodies.rectangle(x + width / 2, y + height / 2, width, height, { isStatic: true });
    }

    update() {
        this.x = this.body.position.x - this.width / 2;
        this.y = this.body.position.y - this.height / 2;
    }

    getBody() {
        return this.body;
    }
}
