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

        let fruittypes = [
            new Fruit(matter_width / 2, drop_ratio * matter_height, 10, "blue"),
            new Fruit(matter_width / 2, drop_ratio * matter_height, 15, "red"),
            new Fruit(matter_width / 2, drop_ratio * matter_height, 20, "green"),
            new Fruit(matter_width / 2, drop_ratio * matter_height, 30, "pink"),
            new Fruit(matter_width / 2, drop_ratio * matter_height, 40, "orange")
        ];

        let currentfruit = fruittypes[Math.floor(Math.random() * fruittypes.length)].createClone();

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
            let sendfruit = currentfruit;
            fruits.set(sendfruit.getBody().id, sendfruit);
            Matter.Composite.add(engine.world, [sendfruit.getBody()]);
            currentfruit = fruittypes[Math.floor(Math.random() * fruittypes.length)].createClone();
            currentfruit.setPosition(sendfruit.x, sendfruit.y);
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

            ctx.fillStyle = "red";

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
