import Link from "next/link";
import NextImage from "next/image";

export default function Help() {
    return (
        <main className="flex min-h-screen flex-col items-center p-4 bg-[url('/trianglify.png')]">
            <div className="flex items-center justify-center">
                <NextImage
                    src="/fruits.png"
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-1/3 lg:w-2/12"
                    alt="Evolution of the fruits"
                />
            </div>
            <h3 className="text-sm text-center xl:text-smmed text-black text-stroke-1 text-stroke-green-400 font-extrabold m-4 max-w-screen-xl w-11/12">
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
