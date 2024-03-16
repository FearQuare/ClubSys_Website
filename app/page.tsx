import Image from "next/image";

export default function Home() {
  return (
    // Define the grid with two rows and center the content in both axes
    <main className="flex flex-col min-h-screen bg-gradient-to-t from-color2 to-color1 justify-between p-10">
      <div className="flex justify-center items-center">
        <Image
          src="/clubsys-logo.svg"
          width={600}
          height={600}
          alt="Clubsys Logo"
        />
      </div>
      <div className="flex justify-center items-center">
        <p className="text-3xl font-bold text-color3 mt-8">Log In</p>
      </div>
      <div className="lex justify-center items-center">
        <p className="text-6xl font-semibold text-white">Welcome to</p>
        <p className="text-6xl font-semibold text-color3">the Club Universe!</p>
      </div>
    </main>
  );
}
