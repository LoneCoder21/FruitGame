"use client";

import Matter from "matter-js";
import { useRef, useEffect, useState, Dispatch } from "react";
import { clamp } from "../utilities";
import { Fruit, RectangleSize, Wall } from "./types";
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { IconContext } from "react-icons";
import Link from "next/link";

export default function Game() {
    const matter_width = 480;
    const matter_height = 600;
    const wall_thick_x = 16;
    const wall_thick_y = 20;
    const wall_thick_y_diff = 9;
    const place_highlight = 5;
    const drop_ratio = 0.1;
    const x_space = 2;
    const spawnwindow = 1000;
    const maxfruitspawn = 4;
    const maxDeathTime = 5000;

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

    let [score, setScore] = useState(0);
    let [nextImage, setNextImage] = useState<string | null>(null);
    let [gameover, setGameOver] = useState(false);
    let [engine, setEngine] = useState(Matter.Engine.create({ gravity: { scale: 0.001 } }));
    let [fruits, setFruits] = useState(new Map<number, Fruit>());
    let [currentFruit, setcurrentFruit] = useState(fruitTypes[Math.floor(Math.random() * maxfruitspawn)].clone());
    let [nextFruit, setnextFruit] = useState(fruitTypes[Math.floor(Math.random() * maxfruitspawn)].clone());
    let [spawnable, setSpawnable] = useState(false);
    let [paused, setPaused] = useState(false);
    let [muted, setMuted] = useState(false);
    let [canvasSize, setCanvasSize] = useState<RectangleSize>({ width: 1, height: 1 });
    const [wallImage, setWallImage] = useState(new Image());
    let [walls] = useState([
        new Wall(0, 0.2 * matter_height, wall_thick_x, matter_height),
        new Wall(matter_width - wall_thick_x, 0.2 * matter_height, wall_thick_x, matter_height),

        new Wall(0, matter_height - wall_thick_y + wall_thick_y_diff, matter_width, wall_thick_y)
    ]);
    let [triggerwall] = useState(new Wall(0, 0 * matter_height, matter_width, 0.35 * matter_height, "trigger", true));

    const canvasref = useRef<HTMLCanvasElement>(null);
    let mouseXRef = useRef(0);
    let bubbleaudio = useRef<HTMLAudioElement>(null);
    let popaudio = useRef<HTMLAudioElement>(null);

    let fruitIndex = new Map<string, number>([
        ["cherry", 0],
        ["strawberry", 1],
        ["grape", 2],
        ["orange", 3],
        ["apple", 4],
        ["pear", 5],
        ["pineapple", 6],
        ["melon", 7],
        ["watermelon", 8]
    ]);

    function resetGame() {
        Matter.Engine.clear(engine);

        setScore(0);
        setNextImage(null);
        setGameOver(false);
        setEngine(Matter.Engine.create({ gravity: { scale: 0.001 } }));
        setFruits(new Map<number, Fruit>());

        setcurrentFruit(fruitTypes[Math.floor(Math.random() * maxfruitspawn)].clone());
        setnextFruit(fruitTypes[Math.floor(Math.random() * maxfruitspawn)].clone());
        setSpawnable(true);
    }

    useEffect(() => {
        function resize() {
            if (!canvasref.current) return;
            const canvas = canvasref.current;
            const size: RectangleSize = {
                width: Math.floor(canvas.getBoundingClientRect().width),
                height: Math.floor(canvas.getBoundingClientRect().height)
            };
            if (canvas.width != size.width || canvas.height != size.height) {
                setCanvasSize(size);
            }
        }
        resize();
        addEventListener("resize", resize);
        return () => {
            removeEventListener("resize", resize);
        };
    });

    useEffect(() => {
        setNextImage(nextFruit.image.src);
    }, [nextFruit]);

    useEffect(() => {
        wallImage.src = "wall.png";
        setWallImage(wallImage);

        walls.forEach((wall) => {
            Matter.Composite.add(engine.world, [wall.getBody()]);
        });
        Matter.Composite.add(engine.world, [triggerwall.getBody()]);
    }, [triggerwall, walls, engine.world, wallImage]);

    useEffect(() => {
        if (spawnable) return;
        let tid = setTimeout(() => {
            setSpawnable(true);
        }, spawnwindow);
        return () => {
            clearTimeout(tid);
        };
    }, [spawnable]);

    const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!spawnable || gameover || paused) {
            return;
        }
        const matter_x = (mouseXRef.current / canvasSize.width) * matter_width;

        fruits.set(currentFruit.getBody().id, currentFruit);
        Matter.Composite.add(engine.world, [currentFruit.getBody()]);
        currentFruit = nextFruit;
        let radius = currentFruit.radius;
        let fruit_x = clamp(matter_x, wall_thick_x + radius + x_space, matter_width - radius - wall_thick_x - x_space);
        currentFruit.setPosition(fruit_x, currentFruit.y);
        nextFruit = fruitTypes[Math.floor(Math.random() * maxfruitspawn)].clone();
        setNextImage(nextFruit.image.src);
        setSpawnable(false);
        setFruits(fruits);
        setcurrentFruit(currentFruit);
        setnextFruit(nextFruit);

        if (!bubbleaudio.current || muted) return;

        let cloneaudio = bubbleaudio.current.cloneNode(true) as HTMLAudioElement;
        cloneaudio.volume = 0.2;
        cloneaudio.play();
    };

    useEffect(() => {
        if (gameover || !canvasref.current || paused) return;
        const canvas = canvasref.current;
        function mousemove(e: MouseEvent) {
            const matter_x = (e.offsetX / canvasSize.width) * matter_width;

            const radius = currentFruit.radius;
            const fruit_x = clamp(
                matter_x,
                wall_thick_x + radius + x_space,
                matter_width - radius - wall_thick_x - x_space
            );
            const fruit_y = drop_ratio * matter_height;
            currentFruit.setPosition(fruit_x, fruit_y);
            mouseXRef.current = e.offsetX;
        }

        canvas.addEventListener("mousemove", mousemove);
        return () => {
            canvas.removeEventListener("mousemove", mousemove);
        };
    });

    useEffect(() => {
        if (gameover || paused) return;
        function collisionStart(e: Matter.IEventCollision<Matter.Engine>) {
            e.pairs.forEach((b) => {
                let fruit1 = fruits.get(b.bodyA.id);
                let fruit2 = fruits.get(b.bodyB.id);

                if (fruit1 && fruit2 && fruit1.name === fruit2.name) {
                    //merge fruits
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
                        wall_thick_x + radius + x_space,
                        matter_width - radius - wall_thick_x - x_space
                    );
                    mergefruit.setPosition(fruit_x, newposition.y);
                    score += fruitscore;

                    setFruits(fruits);
                    setScore(score);

                    if (!popaudio.current || muted) return;

                    let cloneaudio = popaudio.current.cloneNode(true) as HTMLAudioElement;
                    cloneaudio.volume = 0.2;
                    cloneaudio.play();
                } else if (b.bodyA.label === "trigger" || b.bodyB.label === "trigger") {
                    //enable death timer for trigger
                    if (b.bodyA.label === "trigger" && fruit2) {
                        fruit2.deathtimer = performance.now();
                    } else if (b.bodyB.label === "trigger" && fruit1) {
                        fruit1.deathtimer = performance.now();
                    }
                }
            });
        }

        function collisionEnd(e: Matter.IEventCollision<Matter.Engine>) {
            e.pairs.forEach((b) => {
                let fruit1 = fruits.get(b.bodyA.id);
                let fruit2 = fruits.get(b.bodyB.id);

                if (b.bodyA.label === "trigger" || b.bodyB.label === "trigger") {
                    //disable death timer for trigger
                    if (b.bodyA.label === "trigger" && fruit2) {
                        fruit2.deathtimer = null;
                    } else if (b.bodyB.label === "trigger" && fruit1) {
                        fruit1.deathtimer = null;
                    }
                }
            });
        }

        Matter.Events.on(engine, "collisionStart", collisionStart);
        Matter.Events.on(engine, "collisionEnd", collisionEnd);
        return () => {
            Matter.Events.off(engine, "collisionStart", collisionStart);
            Matter.Events.off(engine, "collisionEnd", collisionEnd);
        };
    });

    useEffect(() => {
        if (gameover) return;
        function visibilitychange() {
            setPaused(document.hidden);
            if (!document.hidden) {
                for (let fruit of fruits.values()) {
                    if (fruit.deathtimer) fruit.deathtimer = performance.now();
                } // reset death timer if back to being visible
            }
        }
        document.addEventListener("visibilitychange", visibilitychange);
        return () => {
            document.removeEventListener("visibilitychange", visibilitychange);
        };
    });

    useEffect(() => {
        if (gameover || !canvasref.current || paused) return;
        const canvas = canvasref.current;
        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        let reqid = window.requestAnimationFrame(draw);
        let lastTime = performance.now();

        const tickms = 1000 / 80; // target is 80 fps

        function draw() {
            const now = performance.now();
            const elapsed = now - lastTime;
            if (elapsed < tickms) {
                reqid = window.requestAnimationFrame(draw);
                return;
            }
            lastTime = now;

            // update physics
            for (let fruit of fruits.values()) {
                fruit.update();
                if (fruit.deathtimer && now - fruit.deathtimer >= maxDeathTime) {
                    setGameOver(true);
                }
            }

            ctx.reset();

            ctx.scale(canvasSize.width / matter_width, canvasSize.height / matter_height);

            ctx.fillStyle = "white";

            spawnable &&
                ctx.fillRect(currentFruit.x - place_highlight / 2, currentFruit.y, place_highlight, matter_height); // placeholder white rectangle

            wallImage.complete &&
                ctx.drawImage(wallImage, 0, 0.2 * matter_height, matter_width, (1.0 - 0.2) * matter_height); //image for the box/wall

            for (let fruit of fruits.values()) {
                if (fruit.image.complete) {
                    // rotate the image before drawing it
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
                //rotate fruit to place as well
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
        };
    });

    return (
        <main
            className="flex flex-row flex-wrap items-center justify-center bg-[url('/trianglify.png')]"
            onClick={onClick}
        >
            <audio ref={bubbleaudio} src="bubble.wav"></audio>
            <audio ref={popaudio} src="pop.wav"></audio>
            <SoundControl muted={muted} setMuted={setMuted} />
            <Link
                href="/help"
                className="text-smmed bg-amber-400 px-4 py-1 m-3 font-bold text-white rounded-full shadow-lg shadow-amber-600 hover:bg-amber-500 hover:scale-110 text-stroke-1 text-stroke-amber-800 fixed bottom-0 left-0"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                Help
            </Link>
            {gameover && <GameOver score={score} resetGame={resetGame} />}
            {!gameover && (
                <>
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
                            {nextImage && (
                                <img
                                    src={nextImage}
                                    width={120}
                                    alt="The next fruit to come"
                                    className="aspect-square"
                                />
                            )}
                        </div>
                        <div className="flex items-center justify-center">
                            <img src="/fruits.png" width={180} alt="Evolution of the fruits" />
                        </div>
                    </div>
                </>
            )}
            {
                <canvas
                    ref={canvasref}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    className="border-solid border-black  p-0 h-screen aspect-[4/5]"
                ></canvas>
            }
        </main>
    );
}

function SoundControl({ muted, setMuted }: { muted: boolean; setMuted: Dispatch<boolean> }) {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                setMuted(!muted);
            }}
        >
            <IconContext.Provider
                value={{
                    color: "black",
                    size: "2em",
                    className: "fixed left-0 top-0 m-4 hover:fill-white"
                }}
            >
                {!muted && <FaVolumeUp />}
                {muted && <FaVolumeMute />}
            </IconContext.Provider>
        </button>
    );
}

function GameOver({ score, resetGame }: { score: number; resetGame: Dispatch<void> }) {
    return (
        <div className="p-0 h-screen flex items-center justify-center flex-col m-12 mt-0 mb-0">
            <h1 className="text-xl text-center text-rose-500 text-stroke-2 text-stroke-green-400 font-extrabold sm:text-xl">
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
                    resetGame();
                }}
            >
                Play Again
            </button>
        </div>
    );
}
