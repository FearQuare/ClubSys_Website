import Image from "next/image";

export default function Home() {
  return (
    <body className="bg-gradient-to-t from-cyan-500 to-blue-500">
      <Image src="/clubsys-logo.png"
      width={500}
      height={500}
      alt="Clubsys Logo" />
    </body>
  );
}
