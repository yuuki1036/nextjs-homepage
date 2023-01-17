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
    SUMMARY: "要望のヒアリングから設計・開発・保守まで一貫して行っています。"
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
        REQUIRED: "メールアドレスを入力してください",
        FORMAT: "メールアドレスの形式ではありません。"
      },
      INQUIRY: {
        LABEL: "inquiry",
        REQUIRED: "お問い合わせ内容を入力してください",
        MAX: "500文字以内で入力してください"
      },
      SUCCESS: [
        "お問い合わせを送信しました。",
        "後ほど折り返しご連絡いたします。今しばらくお待ちくださいませ。"
      ],
      FAILED:
        "お問い合わせの送信に失敗しました。お手数ですがもう一度お試しください。"
    }
  }
};
