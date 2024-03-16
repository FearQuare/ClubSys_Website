import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-t from-color2 to-color1 flex justify-center items-center">
      <div>
      <Image src="/clubsys-logo.svg"
      width={600}
      height={600}
      alt="Clubsys Logo"
       />
      </div>
    </main>
  );
}
