"use client";

import Matter from "matter-js";
import { useRef, useEffect } from "react";
import { clamp, lerprange } from "../utilities";
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
        const drop_ratio = 0.1;
        const x_space = 2;

        let engine = Matter.Engine.create({ gravity: { scale: 0.001 } });

        let walls = [
            new Wall(0, 0, wall_thick, matter_height),
            new Wall(matter_width - wall_thick, 0, wall_thick, matter_height),
            new Wall(0, matter_height - wall_thick, matter_width, wall_thick)
        ];
        let fruits = new Map<number, Fruit>();

        let place_x = 0,
            place_y = 0,
            place_radius = 0;

        walls.forEach((wall) => {
            Matter.Composite.add(engine.world, [wall.getBody()]);
        });

        canvas.addEventListener("mousemove", (e) => {
            var rect = canvas.getBoundingClientRect();
            const canvas_x = ((e.clientX - rect.left) / (rect.right - rect.left)) * canvas.width;

            const radius = 30;
            const x_space = 2;
            place_x = clamp(canvas_x, radius + wall_thick + x_space, canvas.width - radius - wall_thick - x_space);
            place_y = drop_ratio * canvas.height;
            place_radius = radius;
        });

        canvas.addEventListener("mousedown", function (e) {
            var rect = canvas.getBoundingClientRect();
            const radius = Math.random() * 30 + 10;

            const canvas_x = ((e.clientX - rect.left) / (rect.right - rect.left)) * canvas.width;
            const matter_x = clamp(
                (canvas_x / canvas.width) * matter_width,
                radius + wall_thick + x_space,
                matter_width - radius - wall_thick - x_space
            );
            const matter_y = drop_ratio * matter_height;

            let fruit = new Fruit(matter_x, matter_y, radius);

            fruits.set(fruit.getBody().id, fruit);
            Matter.Composite.add(engine.world, [fruit.getBody()]);
        });

        let reqid = window.requestAnimationFrame(draw);
        let lasttime = performance.now();

        function draw() {
            const now = performance.now();
            const elapsed = now - lasttime;
            lasttime = now;

            //update physics
            for (let fruit of fruits.values()) {
                fruit.update();
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "white";
            ctx.fillRect(place_x - wall_thick / 2, place_y, wall_thick, canvas.height);

            ctx.fillStyle = "red";
            for (let wall of walls) {
                ctx.fillRect(
                    lerprange(wall.x, 0, matter_width, 0, canvas.width),
                    lerprange(wall.y, 0, matter_height, 0, canvas.height),
                    lerprange(wall.width, 0, matter_width, 0, canvas.width),
                    lerprange(wall.height, 0, matter_height, 0, canvas.height)
                );
            }

            for (let circle of fruits.values()) {
                ctx.beginPath();
                ctx.arc(
                    lerprange(circle.x, 0, matter_width, 0, canvas.width),
                    lerprange(circle.y, 0, matter_height, 0, canvas.height),
                    lerprange(circle.radius, 0, matter_width, 0, canvas.width),
                    0,
                    2 * Math.PI
                );
                ctx.fill();
            }

            ctx.beginPath();
            ctx.arc(place_x, place_y, place_radius, 0, 2 * Math.PI);
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
