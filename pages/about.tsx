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
          <h2>Bio</h2>
          <h3>{MY_NAME}</h3>
          <p>webサービスの設計・開発</p>
          <p>
            福井県出身。<br></br>
            2016年にExcelで簡易会計ソフトを自作。プログラミングの面白さに気づく。
            <br></br>
            2017年よりHTML, CSS, JavaScript等のweb系言語を学ぶ。<br></br>
            2019年から3年間IT機器レンタル会社が運営するECサイトの開発・保守を担当する。
            <br></br>
            2022年よりフリーランスへ転向。
          </p>
          <h2>Skill Map</h2>
          <SkillMap />
          <h2>Certification</h2>
          <ul>
            <li>
              <Link
                href={
                  "https://www.credly.com/badges/122e88cb-c759-469d-908b-d5a010882623/public_url"
                }
                target={"_blank"}
              >
                AWS認定ソリューションアーキテクト - アソシエイト
              </Link>
            </li>
          </ul>

          <h2>Links</h2>
          <ul>
            <li>
              GitHub:{" "}
              <Link href="https://github.com/yuuuki1036">@yuuki1036</Link>
            </li>
            <li>
              Stackshare:{" "}
              <Link href="https://stackshare.io/yuuki1036/my-stack">
                https://stackshare.io/yuuki1036/my-stack
              </Link>
            </li>
            <li>
              Website:{" "}
              <Link href="https://www.yuuki1036.ml">
                https://www.yuuki1036.ml
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </Container>
  );
};

export default About;
