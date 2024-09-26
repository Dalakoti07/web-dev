import Link from "next/link";

export default function Home() {
    return (
        <div className="flex flex-col m-5">
            <Link href="/hover-other-states" className="visited:text-purple-600 hover:text-black">
                    1. Hover N Other states
            </Link>
            <Link href="/hover-other-states" className="visited:text-purple-600 hover:text-black">
                2. Responsive design
            </Link>
        </div>
    );
}
