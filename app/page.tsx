import Image from "next/image";

export default function Home() {
  return (
    <body className="bg-gradient-to-t from-color2 to-color1">
      <Image src="/clubsys-logo.png"
      width={500}
      height={500}
      alt="Clubsys Logo" />
    </body>
  );
}
