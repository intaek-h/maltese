import BackgroundImage from "@public/backgrounds/2.jpg";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <div>
        <Image src={BackgroundImage} width={300} height={300} alt="" />
      </div>
    </div>
  );
}
