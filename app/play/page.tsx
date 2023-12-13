"use client";

import Matter from "matter-js";
import { useRef, useEffect } from "react";
import { clamp } from "../utilities";
import { Fruit, Wall } from "./types";
import useEventListener from "../hooks/eventlistener";

export default function Game() {
    const canvasref = useRef<HTMLCanvasElement>(null);
    let score = useRef<HTMLHeadingElement>(null);
    let nextimage = useRef<HTMLImageElement>(null);

    useEventListener("resize", () => {
        const canvas = canvasref.current!;
        canvas.width = canvas.getBoundingClientRect().width;
        canvas.height = canvas.getBoundingClientRect().height;
    });

    useEffect(() => {
        if (!canvasref.current || !nextimage.current || !score.current) return;
        const canvas = canvasref.current;
        const ctx = canvas.getContext("2d")!;

        const matter_width = 480;
        const matter_height = 600;
        const wall_thick = 10;
        const place_highlight = 5;
        const drop_ratio = 0.1;
        const x_space = 2;
        const spawnwindow = 500;

        let current_score = 0;

        let engine = Matter.Engine.create({ gravity: { scale: 0.001 } });

        let walls = [
            new Wall(0, 0.2 * matter_height, wall_thick, matter_height),
            new Wall(matter_width - wall_thick, 0.2 * matter_height, wall_thick, matter_height),

            new Wall(0, matter_height - wall_thick, matter_width, wall_thick)
        ];
        let fruits = new Map<number, Fruit>();

        let fruitTypes = [
            new Fruit(matter_width / 2, drop_ratio * matter_height, 20, "red", "cherry", 1),
            new Fruit(matter_width / 2, drop_ratio * matter_height, 25, "pink", "strawberry", 2),
            new Fruit(matter_width / 2, drop_ratio * matter_height, 30, "purple", "grape", 4),
            new Fruit(matter_width / 2, drop_ratio * matter_height, 35, "orange", "orange", 8),
            new Fruit(matter_width / 2, drop_ratio * matter_height, 40, "crimson", "apple", 12),
            new Fruit(matter_width / 2, drop_ratio * matter_height, 45, "yellow", "pear", 20),
            new Fruit(matter_width / 2, drop_ratio * matter_height, 55, "darkorange", "pineapple", 32),
            new Fruit(matter_width / 2, drop_ratio * matter_height, 60, "lawngreen", "melon", 75),
            new Fruit(matter_width / 2, drop_ratio * matter_height, 75, "green", "watermelon", 100)
        ];

        const maxfruitspawn = fruitTypes.length;
        let fruitIndex = new Map<string, number>([
            ["cherry", 0],
            ["strawberry", 1],
            ["grape", 2],
            ["orange", 3],
            ["apple", 4],
            ["pear", 5],
            ["peach", 6],
            ["pineapple", 7],
            ["melon", 8],
            ["watermelon", 9]
        ]);

        let currentfruit = fruitTypes[Math.floor(Math.random() * maxfruitspawn)].clone();
        let nextfruit = fruitTypes[Math.floor(Math.random() * maxfruitspawn)].clone();
        let spawnable = true;

        nextimage.current.src = nextfruit.image.src;

        walls.forEach((wall) => {
            Matter.Composite.add(engine.world, [wall.getBody()]);
        });

        let wallimage = new Image();
        wallimage.src = "wall.png";

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
            if ((e.buttons & 1) !== 1 || !spawnable) {
                return;
            }
            const matter_x = (e.offsetX / canvas.width) * matter_width;

            fruits.set(currentfruit.getBody().id, currentfruit);
            Matter.Composite.add(engine.world, [currentfruit.getBody()]);
            currentfruit = nextfruit;
            let radius = currentfruit.radius;
            let fruit_x = clamp(matter_x, wall_thick + radius + x_space, matter_width - radius - wall_thick - x_space);
            currentfruit.setPosition(fruit_x, currentfruit.y);
            nextfruit = fruitTypes[Math.floor(Math.random() * maxfruitspawn)].clone();
            nextimage.current!.src = nextfruit.image.src;
            spawnable = false;
            setTimeout(() => {
                spawnable = true;
            }, spawnwindow);
        });

        Matter.Events.on(engine, "collisionStart", (e) => {
            e.pairs.forEach((b) => {
                let fruit1 = fruits.get(b.bodyA.id);
                let fruit2 = fruits.get(b.bodyB.id);
                if (fruit1 && fruit2 && fruit1.name === fruit2.name) {
                    let fruitscore = fruit1.score + fruit2.score;
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
                    current_score += fruitscore;
                    score.current!.textContent = current_score.toString();
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
            if (spawnable)
                ctx.fillRect(currentfruit.x - place_highlight / 2, currentfruit.y, place_highlight, matter_height);

            if (wallimage.complete) {
                ctx.drawImage(wallimage, 0, 0.2 * matter_height, matter_width, (1.0 - 0.2) * matter_height);
            }

            for (let fruit of fruits.values()) {
                if (fruit.image.complete) {
                    const transform = ctx.getTransform();
                    ctx.translate(fruit.x, fruit.y);
                    ctx.rotate(-fruit.angle);
                    ctx.translate(-fruit.x, -fruit.y);
                    ctx.drawImage(
                        fruit.image,
                        fruit.x - fruit.radius,
                        fruit.y - fruit.radius,
                        fruit.radius * 2,
                        fruit.radius * 2
                    );
                    ctx.setTransform(transform);
                }
            }

            if (currentfruit.image.complete && spawnable) {
                const transform = ctx.getTransform();
                ctx.translate(currentfruit.x, currentfruit.y);
                ctx.rotate(-currentfruit.angle);
                ctx.translate(-currentfruit.x, -currentfruit.y);
                ctx.drawImage(
                    currentfruit.image,
                    currentfruit.x - currentfruit.radius,
                    currentfruit.y - currentfruit.radius,
                    currentfruit.radius * 2,
                    currentfruit.radius * 2
                );
                ctx.setTransform(transform);
            }

            reqid = window.requestAnimationFrame(draw);
            Matter.Engine.update(engine, elapsed);
        }

        return () => {
            cancelAnimationFrame(reqid);
        };
    }, []);

    return (
        <main className="flex flex-row flex-wrap items-center justify-center bg-amber-100">
            <div className="m-12 mt-0 mb-0">
                <div className="flex flex-col items-center">
                    <h3 className="text-center text-stroke-black text-stroke-1 text-white text-base font-bold">
                        Score
                    </h3>
                    <div className="p-1 m-1 mt-0 font-extrabold text-white rounded-lg w-6/12 text-right bg-gradient-to-t from-amber-700 to-amber-300">
                        <h4 ref={score} className="text-sm">
                            0
                        </h4>
                    </div>
                </div>
                <div className="flex items-center justify-center rounded-full border-8 border-white p-8 m-5 from-amber-500 bg-gradient-to-tl via-white">
                    <img
                        ref={nextimage}
                        src="/apple.png"
                        width={120}
                        alt="Evolution of the fruits"
                        className="aspect-square"
                    />
                </div>
                <div className="flex items-center justify-center">
                    <img src="/fruits.png" width={180} alt="Evolution of the fruits" />
                </div>
            </div>
            <canvas
                ref={canvasref}
                width={1000}
                className="border-solid border-black  p-0 h-screen aspect-[4/5]"
            ></canvas>
        </main>
    );
}
