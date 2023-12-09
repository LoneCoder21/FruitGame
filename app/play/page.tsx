"use client";

import Matter from "matter-js";
import { useRef, useEffect, useState } from "react";

type Rectangle = {
    x: number;
    y: number;
    width: number;
    height: number;
};

function createRectangle(x: number, y: number, width: number, height: number): Rectangle {
    return {
        x,
        y,
        width,
        height
    };
}

function lerprange(value: number, x1: number, x2: number, y1: number, y2: number) {
    let t = (value - x1) / (x2 - x1);
    return t * (y2 - y1) + y1;
}

export default function Game() {
    const canvasref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasref.current) return;
        const canvas = canvasref.current;
        const ctx = canvas.getContext("2d")!;

        const matter_width = 480;
        const matter_height = 600;
        const matter_aspect = matter_height / matter_width;
        const wall_thick = 10;
        const drop_ratio = 0.1;

        let engine = Matter.Engine.create({ gravity: { scale: 0.001 } });
        let circles: Matter.Body[] = [];
        let walls = [
            createRectangle(0, 0, wall_thick, matter_height),
            createRectangle(matter_width - wall_thick, 0, wall_thick, matter_height),
            createRectangle(0, matter_height - wall_thick, matter_width, wall_thick)
        ];

        Matter.Composite.add(
            engine.world,
            walls.map((wall) => {
                return Matter.Bodies.rectangle(
                    wall.x + wall.width / 2,
                    wall.y + wall.height / 2,
                    wall.width,
                    wall.height,
                    { isStatic: true }
                );
            })
        );

        let place_x = 0,
            place_y = 0,
            place_radius = 0;

        canvas.addEventListener("mousemove", (e) => {
            var rect = canvas.getBoundingClientRect();
            const canvas_x = ((e.clientX - rect.left) / (rect.right - rect.left)) * canvas.width;

            const radius = 30;
            const x_space = 2;
            place_x = Math.max(
                Math.min(canvas_x, canvas.width - radius - wall_thick - x_space),
                radius + wall_thick + x_space
            );
            place_y = drop_ratio * canvas.height;
            place_radius = radius;
        });

        canvas.addEventListener("mousedown", function (e) {
            var rect = canvas.getBoundingClientRect();
            const canvas_x = ((e.clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
                canvas_y = ((e.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height;
            const matter_x = (canvas_x / canvas.width) * matter_width,
                matter_y = drop_ratio * matter_height;
            const radius = Math.random() * 30 + 10;
            const x_space = 2;

            circles.push(
                Matter.Bodies.circle(
                    Math.max(
                        Math.min(matter_x, matter_width - radius - wall_thick - x_space),
                        radius + wall_thick + x_space
                    ),
                    matter_y,
                    radius
                )
            );
            console.log(matter_x, matter_y);
            Matter.Composite.add(engine.world, [circles.at(-1)!]);
        });

        let reqid = window.requestAnimationFrame(draw);
        let lasttime = performance.now();

        function draw() {
            const now = performance.now();
            const elapsed = now - lasttime;
            lasttime = now;

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

            for (let circle of circles) {
                ctx.beginPath();
                ctx.arc(
                    lerprange(circle.position.x, 0, matter_width, 0, canvas.width),
                    lerprange(circle.position.y, 0, matter_height, 0, canvas.height),
                    lerprange(circle.circleRadius!, 0, matter_width, 0, canvas.width),
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

    useEffect(() => {
        function resizeEvent() {
            const canvas = canvasref.current!;
            canvas.width = canvas.getBoundingClientRect().width;
            canvas.height = canvas.getBoundingClientRect().height;
        }
        resizeEvent();
        addEventListener("resize", resizeEvent);
        return () => {
            removeEventListener("resize", resizeEvent);
        };
    });

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
