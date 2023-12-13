import Link from "next/link";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col bg-[radial-gradient(circle,rgba(178,255,187,1)_0%,rgba(255,146,138,1)_100%)]">
            <section className="flex flex-col items-center my-40">
                <h1 className="text-xl text-center text-rose-500 text-stroke-2 text-stroke-green-400 font-extrabold sm:text-mxl">
                    Watermelon Game
                </h1>
                <Link
                    href="/play"
                    className="text-base bg-amber-400 px-12 py-3 m-3 font-bold text-white rounded-full shadow-lg shadow-amber-600 hover:bg-amber-500 hover:scale-110 text-stroke-1 text-stroke-amber-800"
                >
                    Start Game
                </Link>
                <Link
                    href="/help"
                    className="text-base bg-emerald-300 px-12 py-3 m-3 font-bold text-white rounded-full shadow-lg shadow-emerald-500 hover:bg-emerald-400 hover:scale-110 text-stroke-1 text-stroke-emerald-800"
                >
                    How to Play
                </Link>
            </section>
        </main>
    );
}
