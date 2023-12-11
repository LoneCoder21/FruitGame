"use client";

import Matter from "matter-js";
import { useRef, useEffect } from "react";
import { clamp } from "../utilities";
import { Fruit, Wall } from "./types";
import useEventListener from "../hooks/eventlistener";

export default function Game() {
    const canvasref = useRef<HTMLCanvasElement>(null);

    useEventListener("resize", () => {
        const canvas = canvasref.current!;
        canvas.width = canvas.getBoundingClientRect().width;
        canvas.height = canvas.getBoundingClientRect().height;
    });

    useEffect(() => {
        if (!canvasref.current) return;
        const canvas = canvasref.current;
        const ctx = canvas.getContext("2d")!;

        const matter_width = 480;
        const matter_height = 600;
        const wall_thick = 10;
        const place_highlight = 5;
        const drop_ratio = 0.1;
        const x_space = 2;

        let engine = Matter.Engine.create({ gravity: { scale: 0.001 } });

        let walls = [
            new Wall(0, 0, wall_thick, matter_height),
            new Wall(matter_width - wall_thick, 0, wall_thick, matter_height),
            new Wall(0, matter_height - wall_thick, matter_width, wall_thick)
        ];
        let fruits = new Map<number, Fruit>();

        let fruitTypes = [
            new Fruit(matter_width / 2, drop_ratio * matter_height, 10, "blue", "grape"),
            new Fruit(matter_width / 2, drop_ratio * matter_height, 15, "red", "strawberry"),
            new Fruit(matter_width / 2, drop_ratio * matter_height, 20, "green", "pear"),
            new Fruit(matter_width / 2, drop_ratio * matter_height, 30, "pink", "melon"),
            new Fruit(matter_width / 2, drop_ratio * matter_height, 40, "orange", "pumpkin")
        ];
        let fruitIndex = new Map<string, number>([
            ["grape", 0],
            ["strawberry", 1],
            ["pear", 2],
            ["melon", 3],
            ["pumpkin", 4]
        ]);
        let currentfruit = fruitTypes[Math.floor(Math.random() * fruitTypes.length)].clone();

        walls.forEach((wall) => {
            Matter.Composite.add(engine.world, [wall.getBody()]);
        });

        canvas.addEventListener("mousemove", (e) => {
            const matter_x = (e.offsetX / canvas.width) * matter_width;

            const radius = currentfruit.radius;
            const fruit_x = clamp(
                matter_x,
                wall_thick + radius + x_space,
                matter_width - radius - wall_thick - x_space
            );
            const fruit_y = drop_ratio * matter_height;

            currentfruit.setPosition(fruit_x, fruit_y);
        });

        canvas.addEventListener("mousedown", function (e) {
            const matter_x = (e.offsetX / canvas.width) * matter_width;

            fruits.set(currentfruit.getBody().id, currentfruit);
            Matter.Composite.add(engine.world, [currentfruit.getBody()]);
            currentfruit = fruitTypes[Math.floor(Math.random() * fruitTypes.length)].clone();
            let radius = currentfruit.radius;
            let fruit_x = clamp(matter_x, wall_thick + radius + x_space, matter_width - radius - wall_thick - x_space);
            currentfruit.setPosition(fruit_x, currentfruit.y);
        });

        Matter.Events.on(engine, "collisionStart", (e) => {
            e.pairs.forEach((b) => {
                let fruit1 = fruits.get(b.bodyA.id);
                let fruit2 = fruits.get(b.bodyB.id);
                if (fruit1 && fruit2 && fruit1.name === fruit2.name) {
                    console.log(fruit1, fruit2);
                    Matter.World.remove(engine.world, b.bodyA);
                    Matter.World.remove(engine.world, b.bodyB);
                    fruits.delete(b.bodyA.id);
                    fruits.delete(b.bodyB.id);

                    let newposition = Matter.Vector.div(Matter.Vector.add(b.bodyA.position, b.bodyB.position), 2);
                    let nextfruitIndex = (fruitIndex.get(fruit1.name)! + 1) % fruitTypes.length;
                    let nextfruit = fruitTypes[nextfruitIndex].clone();

                    fruits.set(nextfruit.getBody().id, nextfruit);
                    Matter.Composite.add(engine.world, [nextfruit.getBody()]);
                    let radius = nextfruit.radius;
                    let fruit_x = clamp(
                        newposition.x,
                        wall_thick + radius + x_space,
                        matter_width - radius - wall_thick - x_space
                    );
                    nextfruit.setPosition(fruit_x, newposition.y);
                }
            });
        });

        let reqid = window.requestAnimationFrame(draw);
        let lasttime = performance.now();

        function draw() {
            const now = performance.now();
            const elapsed = now - lasttime;
            lasttime = now;

            // update physics
            for (let fruit of fruits.values()) {
                fruit.update();
            }

            ctx.reset();

            ctx.scale(canvas.width / matter_width, canvas.height / matter_height);

            ctx.fillStyle = "white";
            ctx.fillRect(currentfruit.x - place_highlight / 2, currentfruit.y, place_highlight, matter_height);

            ctx.fillStyle = "brown";

            for (let wall of walls) {
                ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
            }

            for (let fruit of fruits.values()) {
                ctx.fillStyle = fruit.color;
                ctx.beginPath();
                ctx.arc(fruit.x, fruit.y, fruit.radius, 0, 2 * Math.PI);
                ctx.fill();
            }

            ctx.fillStyle = currentfruit.color;
            ctx.beginPath();
            ctx.arc(currentfruit.x, currentfruit.y, currentfruit.radius, 0, 2 * Math.PI);
            ctx.fill();

            reqid = window.requestAnimationFrame(draw);
            Matter.Engine.update(engine, elapsed);
        }

        return () => {
            cancelAnimationFrame(reqid);
        };
    }, []);

    return (
        <main className="flex min-h-screen flex-col items-center justify-between bg-amber-100">
            <canvas
                ref={canvasref}
                width={1000}
                className="border-solid border-black  p-0 h-screen aspect-[4/5]"
            ></canvas>
        </main>
    );
}
