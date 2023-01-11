import Link from "next/link";
import Image from "next/image";

import { MY_NAME } from "lib/constants";
import Container from "components/Container";
import avatar from "public/avatar.jpg";
import avatarBW from "public/avatar-bw.jpg";
import { NextPage } from "next";
import dynamic from "next/dynamic";

const SkillMap = dynamic(() => import("components/SkillMap"), { ssr: false });

const About: NextPage = () => {
  return (
    <Container title={`${MY_NAME} - about`}>
      <div className="flex flex-col justify-center items-start max-w-2xl mx-auto mb-16 w-full">
        <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-4 text-black dark:text-white">
          About Me
        </h1>
        <div className="mb-8 prose dark:prose-dark leading-6">
          <h2>Links</h2>
          <ul>
            <li>
              GitHub: <a href="https://github.com/leerob">@leerob</a>
            </li>
            <li>
              Website: <Link href="https://leerob.io">https://leerob.io</Link>
            </li>
          </ul>
          <h2>Bio</h2>
          <h3>{MY_NAME}</h3>
          <p>web enngineer</p>
          <p>
            2017年より独学でプログラミングを学ぶ。<br></br>
            2019年よりECサイト運営企業で開発・保守を行う。<br></br>
            2022年より独立。東京の案件に参加しながら地元企業・個人の依頼をこなしています。
          </p>
          <h2>Mind Map</h2>
          <SkillMap />
        </div>
      </div>
    </Container>
  );
};

export default About;
