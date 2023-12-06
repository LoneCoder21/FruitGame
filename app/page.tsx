import Link from "next/link";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-amber-100">
            <section className="flex flex-col items-center justify-between p-24">
                <h2 className="text-xl text-amber-600">Watermelon Game</h2>
                <Link
                    href="/play"
                    className="text-base bg-amber-400 px-12 py-3 text-white m-3 rounded-full shadow-lg shadow-amber-600 drop-shadow-lg hover:bg-amber-500"
                >
                    Start Game
                </Link>
                <Link
                    href="/help"
                    className="text-base bg-emerald-300 px-12 py-3 text-white m-3 rounded-full shadow-lg shadow-emerald-500 hover:bg-emerald-400"
                >
                    How to Play
                </Link>
            </section>
        </main>
    );
}
