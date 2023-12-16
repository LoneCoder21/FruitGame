import Link from "next/link";

export default function Help() {
    return (
        <main className="flex min-h-screen flex-col items-center p-24 bg-[radial-gradient(circle,rgba(178,255,187,1)_0%,rgba(255,146,138,1)_100%)]">
            <div className="flex items-center justify-center">
                <img src="/fruits.png" width={320} alt="Evolution of the fruits" />
            </div>
            <h3 className="text-smmed text-center text-black text-stroke-1 text-stroke-green-400 font-extrabold m-4 w-8/12">
                Your goal is to achieve the highest score possible by merging fruits. <br />
                Two identical fruits merge into a bigger fruit as shown. <br />
                Merging bigger fruits gives more points. <br />
                Have fun 😊
            </h3>
            <Link
                href="/play"
                className="text-base bg-amber-400 px-12 py-3 m-3 font-bold text-white rounded-full shadow-lg shadow-amber-600 hover:bg-amber-500 hover:scale-110 text-stroke-1 text-stroke-amber-800"
            >
                Start Game
            </Link>
        </main>
    );
}
