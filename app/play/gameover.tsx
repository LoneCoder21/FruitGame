import { Dispatch } from "react";

export default function GameOver({ score, resetGame }: { score: number; resetGame: Dispatch<void> }) {
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
