import Container from "components/Container";
import { NextPage } from "next";
import Image from "next/image";

const Service: NextPage = () => {
  return (
    <Container
      title="Service – yuuki1036"
      description="Thoughts on the software industry, programming, tech, videography, music, and my personal life."
    >
      <div className="flex flex-col items-start justify-center max-w-2xl mx-auto mb-16">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl dark:text-white">
          Service
        </h1>
        <p className="mb-14 text-gray-600 dark:text-gray-400">
          {`I've been writing online since 2014, mostly about web development and tech careers.
            In total, I've written articles on my blog.
            Use the search below to filter by title.`}
        </p>

        <div id="homepage" className="pt-2 mb-14">
          <h3 className="mb-1 text-lg font-bold tracking-tight text-black md:text-2xl dark:text-white">
            ホームページ作成
          </h3>
          <p className="mb-3 text-gray-600 dark:text-gray-400">
            用途や規模に応じたホームページを作成いたします。JavaScriptを使用した動きのあるサイトや問い合わせフォームなど、様々なサイトに対応しております。
          </p>
          <Image
            className="mb-4 dark:saturate-[80%] dark:brightness-[80%] rounded-lg border-2 border-gray-300"
            alt="homepage"
            src={`/images/service/homepage.png`}
            width={400}
            height={469}
          />
          <div className="text-gray-600 dark:text-gray-400">
            <p className="mb-2">
              モバイルファーストな現代に合わせてレスポンシブ（画面サイズに依らない）な画面設計を心がけています。
            </p>
            <p className="mb-2">
              またWEBサイトの表示速度については閲覧者の離脱率やSEO（検索エンジンへの最適化）に大きく影響を与えますので可能な限りチューニングを行います。
            </p>
            <p className="">
              WordPressやDrupalなどのCMSを導入し、サイト運用後のコンテンツ管理をお客様におまかせする事も可能です。
            </p>
          </div>
        </div>

        <div id="ec" className="pt-2 mb-14">
          <h3 className="mb-1 text-lg font-bold tracking-tight text-black md:text-2xl dark:text-white">
            ECサイト構築
          </h3>
          <p className="mb-3 text-gray-600 dark:text-gray-400">
            サイト内で商品を選択・決済可能なECサイト（ショッピングサイト）を構築いたします。アカウント機能を実装してサイトの利便性をより高めることも可能です。
          </p>
          <Image
            className="mb-4 dark:saturate-[80%] dark:brightness-[80%] rounded-lg border-2 border-gray-300"
            alt="shopping"
            src={`/images/service/shopping.png`}
            width={400}
            height={469}
          />
          <div className="text-gray-600 dark:text-gray-400">
            <p className="mb-2">
              月間15万PVの中規模ECサイト開発に携わっていた経験をもとに設計・実装を行います。
            </p>
            <p className="mb-2">
              ECサイトは個人情報を取り扱いますので、ハッカーなどの悪意のあるユーザーに狙われやすくなります。様々なハッキングの手口を念頭においた設計を行い、セキュアで堅牢なサイトを構築します。
            </p>
            <p className="">
              ECサイト構築サービスであるshopifyを利用して開発コストを下げることも可能です。
            </p>
          </div>
        </div>

        <div id="system" className="pt-2 mb-14">
          <h3 className="mb-1 text-lg font-bold tracking-tight text-black md:text-2xl dark:text-white">
            業務用WEBシステム構築
          </h3>
          <p className="mb-3 text-gray-600 dark:text-gray-400">
            業務に特化したオリジナルのWEBシステムを構築いたします。要望をヒアリングした上で方法・技術を選択しますので、まずはお気軽にご相談ください。
          </p>
          <Image
            className="mb-4 dark:saturate-[80%] dark:brightness-[80%] rounded-lg border-2 border-gray-300"
            alt="web system"
            src={`/images/service/system.png`}
            width={400}
            height={400}
          />
          <div className="text-gray-600 dark:text-gray-400">
            <p className="mb-2">
              PC・タブレット・スマートフォンでアクセス可能なWEBシステムを構築いたします。既存のシステムとの連携も可能です。
            </p>
            <p className="">
              サーバーはオンプレミス・クラウドなど用途に応じて選択可能です。事業の拡大に合わせてフレキシブルに対応できるクラウドサーバーをお勧めしています。
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Service;