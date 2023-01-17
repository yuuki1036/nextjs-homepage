/* eslint-disable import/no-anonymous-default-export */
export default {
  INDEX: {
    SUMMARY:
      "A freelance engineer living in Japan, working on website production and development of web systems for business use.",
    SERVICE:
      "We can flexibly handle everything from simple websites to web systems that support business operations. We accept requests from both companies and individuals.",
    SERVICE_CARDS: {
      HOMEPAGE: "Web site creation",
      EC: "EC site construction",
      SYSTEM: "Businesss Web system construction"
    }
  },
  WORKS: {
    SUMMARY: "list of websites and applications we have created so far."
  },
  SERVICE: {
    SUMMARY:
      "We provide consistent services from hearing of requests to design, development, and maintenance. We emphasize the following items in the development process.",
    LIST: [
      "Designed for easy maintenance and scalability",
      "UI/UX (user experience) conscious design",
      "Site performance (for web sites)"
    ],
    HOMEPAGE: {
      TITLE: "ホームページ作成",
      SUMMARY:
        "用途や規模に応じたホームページを作成いたします。JavaScriptを使用した動きのあるサイトや問い合わせフォームなど、様々なサイトに対応しております。",
      DETAIL: [
        "モバイルファーストな現代に合わせてレスポンシブ（画面サイズに依らない）な画面設計を心がけています。",
        "またWEBサイトの表示速度については閲覧者の離脱率やSEO（検索エンジンへの最適化）に大きく影響を与えますので可能な限りチューニングを行います。",
        "WordPressやDrupalなどのCMSを導入し、サイト運用後のコンテンツ管理をお客様におまかせする事も可能です。"
      ]
    }
  },
  ABOUT: {
    DESCRIPT: "About freelance engineer yuuki1036.",
    BIO: {
      SUPPLEMENT: "Design and development of web services",
      DETAILS: [
        "I discovered the fun of programming in 2016 when I created my own simple accounting software in Excel. After that I started learning web-based languages such as HTML, CSS, JavaScript.",
        "From 2019 I participated in the development and maintenance of an EC site operated by an IT equipment rental company for 3 years. Then, in 2022, I became a freelancer."
      ]
    },
    CERTIFICATION: ["AWS Certified Solutions Architect – Associate"]
  },
  CONTACT: {
    SUMMARY:
      "Please contact us for development requests, consultation, questions about the web.",
    FORM: {
      NAME: {
        LABEL: "name",
        REQUIRED: "Please enter your name",
        MAX: "Please enter up to 60 characters"
      },
      MAIL: {
        LABEL: "email",
        REQUIRED: "Please enter your email address",
        FORMAT: "Not in the form of an email address"
      },
      INQUIRY: {
        LABEL: "inquiry",
        REQUIRED: "Please enter your inquiry",
        MAX: "Please enter up to 500 characters"
      },
      SUCCESS: [
        "Your inquiry has been sent.",
        "We will contact you shortly. Please wait for a while."
      ],
      FAILED: "Failed to send your inquiry. Please try again."
    }
  }
};
