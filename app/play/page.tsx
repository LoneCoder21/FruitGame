"use client";

import Matter from "matter-js";
import { useRef, useEffect, useState } from "react";
import { clamp } from "../utilities";
import { Fruit, Wall } from "./types";

export default function Game() {
    // const bubbleaudio = document.createElement("audio");
    // bubbleaudio.src = "bubble.wav";

    // const popaudio = document.createElement("audio");
    // popaudio.src = "pop.wav";

    const matter_width = 480;
    const matter_height = 600;
    const wall_thick = 13;
    const place_highlight = 5;
    const drop_ratio = 0.1;
    const x_space = 2;
    const spawnwindow = 500;
    const maxfruitspawn = 4;

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

    const canvasref = useRef<HTMLCanvasElement>(null);
    let [score, setScore] = useState(0);
    let nextimage = useState<string | null>(null);
    let [gameover, setGameOver] = useState(false);
    let [engine] = useState(Matter.Engine.create({ gravity: { scale: 0.001 } }));
    let [fruits, setFruits] = useState(new Map<number, Fruit>());
    let [currentFruit, setcurrentFruit] = useState(fruitTypes[Math.floor(Math.random() * maxfruitspawn)].clone());
    let [nextFruit, setnextFruit] = useState(fruitTypes[Math.floor(Math.random() * maxfruitspawn)].clone());
    let [spawnable, setSpawnable] = useState(true);

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

    let walls = [
        new Wall(0, 0.2 * matter_height, wall_thick, matter_height),
        new Wall(matter_width - wall_thick, 0.2 * matter_height, wall_thick, matter_height),

        new Wall(0, matter_height - wall_thick, matter_width, wall_thick)
    ];

    useEffect(() => {
        function resize() {
            const canvas = canvasref.current;
            if (!canvas) return;
            canvas.width = canvas.getBoundingClientRect().width;
            canvas.height = canvas.getBoundingClientRect().height;
        }
        addEventListener("resize", resize);
        return () => {
            removeEventListener("resize", resize);
        };
    });

    useEffect(() => {
        if (spawnable) return;
        let tid = setTimeout(() => {
            spawnable = true;
        }, spawnwindow);
        return () => {
            clearTimeout(tid);
        };
    }, [spawnable]);

    useEffect(() => {
        walls.forEach((wall) => {
            Matter.Composite.add(engine.world, [wall.getBody()]);
        });
    }, []); // add walls

    useEffect(() => {
        if (!canvasref.current) return;
        const canvas = canvasref.current;
        const ctx = canvas.getContext("2d")!;

        console.log(canvas.width, canvas.height);

        console.log("canvas run");

        function mousemove(e: MouseEvent) {
            const matter_x = (e.offsetX / canvas.width) * matter_width;

            const radius = currentFruit.radius;
            const fruit_x = clamp(
                matter_x,
                wall_thick + radius + x_space,
                matter_width - radius - wall_thick - x_space
            );
            const fruit_y = drop_ratio * matter_height;

            currentFruit.setPosition(fruit_x, fruit_y);
        }

        function mousedown(e: MouseEvent) {
            e.stopPropagation();
            if ((e.buttons & 1) !== 1 || !spawnable) {
                return;
            }
            const matter_x = (e.offsetX / canvas.width) * matter_width;

            fruits.set(currentFruit.getBody().id, currentFruit);
            Matter.Composite.add(engine.world, [currentFruit.getBody()]);
            currentFruit = nextFruit;
            let radius = currentFruit.radius;
            let fruit_x = clamp(matter_x, wall_thick + radius + x_space, matter_width - radius - wall_thick - x_space);
            currentFruit.setPosition(fruit_x, currentFruit.y);
            nextFruit = fruitTypes[Math.floor(Math.random() * maxfruitspawn)].clone();
            //nextimage.current!.src = nextFruit.image.src;
            setSpawnable(false);
            setFruits(fruits);
            setcurrentFruit(currentFruit);
            setnextFruit(nextFruit);

            // let cloneaudio = bubbleaudio.cloneNode(true) as HTMLAudioElement;
            // cloneaudio.volume = 0.2;
            // cloneaudio.play();
        }

        canvas.addEventListener("mousemove", mousemove);
        canvas.addEventListener("mousedown", mousedown);

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
                    let mergefruitIndex = (fruitIndex.get(fruit1.name)! + 1) % fruitTypes.length;
                    let mergefruit = fruitTypes[mergefruitIndex].clone();

                    fruits.set(mergefruit.getBody().id, mergefruit);
                    Matter.Composite.add(engine.world, [mergefruit.getBody()]);
                    let radius = mergefruit.radius;
                    let fruit_x = clamp(
                        newposition.x,
                        wall_thick + radius + x_space,
                        matter_width - radius - wall_thick - x_space
                    );
                    mergefruit.setPosition(fruit_x, newposition.y);
                    score += fruitscore;

                    setFruits(fruits);
                    setScore(score);

                    // let cloneaudio = popaudio.cloneNode(true) as HTMLAudioElement;
                    // cloneaudio.volume = 0.2;
                    // cloneaudio.play();
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
                ctx.fillRect(currentFruit.x - place_highlight / 2, currentFruit.y, place_highlight, matter_height);

            // if (wallimage.complete) {
            //     ctx.drawImage(wallimage, 0, 0.2 * matter_height, matter_width, (1.0 - 0.2) * matter_height);
            // }

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

            if (currentFruit.image.complete && spawnable) {
                const transform = ctx.getTransform();
                ctx.translate(currentFruit.x, currentFruit.y);
                ctx.rotate(-currentFruit.angle);
                ctx.translate(-currentFruit.x, -currentFruit.y);
                ctx.drawImage(
                    currentFruit.image,
                    currentFruit.x - currentFruit.radius,
                    currentFruit.y - currentFruit.radius,
                    currentFruit.radius * 2,
                    currentFruit.radius * 2
                );
                ctx.setTransform(transform);
            }

            reqid = window.requestAnimationFrame(draw);
            Matter.Engine.update(engine, elapsed);
        }

        return () => {
            cancelAnimationFrame(reqid);
            removeEventListener("mousedown", mousedown);
            removeEventListener("mousemove", mousemove);
        };
    });

    return (
        <main className="flex flex-row flex-wrap items-center justify-center bg-[radial-gradient(circle,rgba(178,255,187,1)_0%,rgba(255,146,138,1)_100%)]">
            {gameover && <GameOver score={3} />}
            {!gameover && (
                <div className="m-12 mt-0 mb-0">
                    <div className="flex flex-col items-center">
                        <h3 className="text-center text-stroke-black text-stroke-1 text-white text-base font-bold">
                            Score
                        </h3>
                        <div className="p-1 m-1 mt-0 font-extrabold text-white rounded-lg w-6/12 text-right bg-gradient-to-t from-red-700 to-red-300">
                            <h4 className="text-sm">{score}</h4>
                        </div>
                    </div>
                    <div className="flex items-center justify-center rounded-full border-8 border-white p-8 m-5 from-red-500 bg-gradient-to-tl via-white">
                        <img src="/apple.png" width={120} alt="Evolution of the fruits" className="aspect-square" />
                    </div>
                    <div className="flex items-center justify-center">
                        <img src="/fruits.png" width={180} alt="Evolution of the fruits" />
                    </div>
                </div>
            )}
            {!gameover && (
                <canvas
                    ref={canvasref}
                    width={1000}
                    className="border-solid border-black  p-0 h-screen aspect-[4/5]"
                ></canvas>
            )}
        </main>
    );
}

function GameOver({ score }: { score: number }) {
    return (
        <div className=" p-0 h-screen flex items-center justify-center flex-col">
            <h1 className="text-xl text-center text-rose-500 text-stroke-2 text-stroke-green-400 font-extrabold sm:text-mxl">
                GameOver
            </h1>
            <div className="flex flex-row justify-center align-middle w-full">
                <div className="p-1 px-6 m-1 mt-0 font-extrabold text-white rounded-lg  text-center bg-gradient-to-t from-red-700 to-red-300">
                    <h4 className="text-sm">{score}</h4>
                </div>
            </div>
            <button
                className="text-base bg-amber-400 px-12 py-3 m-3 font-bold text-white rounded-full shadow-lg shadow-amber-600 hover:bg-amber-500 hover:scale-110 text-stroke-1 text-stroke-amber-800"
                onClick={() => {
                    window.location.reload();
                }}
            >
                Play Again
            </button>
        </div>
    );
}
