import Link from "next/link";
import NextImage from "next/image";

export default function NotFound() {
    return (
        <main className="flex min-h-screen flex-col bg-[url('/trianglify.png')]">
            <section className="flex flex-col items-center my-40">
                <NextImage src="/orange.png" width={320} height={320} alt="Sad orange" />
                <h1 className="text-med text-center text-rose-500 text-stroke-2 text-stroke-green-400 font-extrabold">
                    404 - Not Found
                </h1>
                <Link
                    href="/"
                    className="text-base bg-emerald-300 px-12 py-3 m-3 font-bold text-white rounded-full shadow-lg shadow-emerald-500 hover:bg-emerald-400 hover:scale-110 text-stroke-1 text-stroke-emerald-800"
                >
                    Return to Home
                </Link>
            </section>
        </main>
    );
}
