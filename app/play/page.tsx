"use client";

import { useRef, useEffect, useState } from "react";

export default function Game() {
    const canvasref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasref.current) return;
        const canvas = canvasref.current;
        const ctx = canvas.getContext("2d")!;

        let reqid = window.requestAnimationFrame(draw);
        function draw() {
            console.log(canvas.width, canvas.height);

            ctx.beginPath();
            ctx.moveTo(75, 25);
            ctx.quadraticCurveTo(25, 25, 25, 62.5);
            ctx.quadraticCurveTo(25, 100, 50, 100);
            ctx.quadraticCurveTo(50, 120, 30, 125);
            ctx.quadraticCurveTo(60, 120, 65, 100);
            ctx.quadraticCurveTo(125, 100, 125, 62.5);
            ctx.quadraticCurveTo(125, 25, 75, 25);
            ctx.stroke();

            reqid = window.requestAnimationFrame(draw);
        }

        return () => {
            cancelAnimationFrame(reqid);
        };
    }, []);

    useEffect(() => {
        function resizeEvent(event: UIEvent) {
            if (!canvasref.current) return;
            const canvas = canvasref.current;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        addEventListener("resize", resizeEvent);
        return () => {
            removeEventListener("resize", resizeEvent);
        };
    });

    return (
        <main className="flex min-h-screen flex-col items-center justify-between bg-amber-100">
            <canvas
                width={window.innerWidth}
                height={window.innerHeight}
                ref={canvasref}
                className="border-solid border-black border-2 w-full h-screen p-1"
            ></canvas>
        </main>
    );
}
