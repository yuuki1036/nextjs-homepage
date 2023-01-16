import Link from "next/link";
import Image from "next/image";
import { MY_NAME, URL } from "lib/constants";
import Container from "components/Container";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import ExternalLink from "components/ExternalLink";

const SkillMap = dynamic(() => import("components/SkillMap"), { ssr: false });

const About: NextPage = () => {
  return (
    <Container
      pageName="About"
      description="フリーランスエンジニアyuuki1036について。"
    >
      <div className="flex flex-col justify-center items-start max-w-2xl mx-auto mb-16 w-full">
        <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-4 text-black dark:text-white">
          About Me
        </h1>
        <div className="mb-8 prose dark:prose-dark leading-6">
          <h2>Bio</h2>
          <div className="flex items-end">
            <h3 className="my-0 mr-2">{MY_NAME}</h3>
            <Image
              className="rounded-full filter bg-gray-100 dark-image-layer"
              alt={MY_NAME}
              height={35}
              width={35}
              src="/images/avatar.png"
              priority
            />
          </div>
          <p className="mt-1">webサービスの設計・開発</p>
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
          <Suspense fallback={null}>
            <div className="w-full h-[25rem] md:h-[35rem]">
              <SkillMap />
            </div>
          </Suspense>

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
              <ExternalLink href="https://github.com/yuuki1036">
                @yuuki1036
              </ExternalLink>
            </li>
            <li>
              Stackshare:{" "}
              <ExternalLink href="https://stackshare.io/yuuki1036/my-stack">
                https://stackshare.io/yuuki1036/my-stack
              </ExternalLink>
            </li>
            <li>
              Website:{" "}
              <ExternalLink href="https://yuuki1036.com">{URL}</ExternalLink>
            </li>
          </ul>
        </div>
      </div>
    </Container>
  );
};

export default About;
