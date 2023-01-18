/* eslint-disable import/no-anonymous-default-export */
export default {
  INDEX: {
    SUMMARY:
      "A freelance engineer living in Japan, working on website production and development of web systems for business use.",
    SERVICE:
      "We offer flexible services ranging from simple websites to web systems that support business operations. We accept requests from both companies and individuals.",
    SERVICE_CARDS: {
      HOMEPAGE: "Home Page",
      EC: "E-commerce Site",
      SYSTEM: "Businesss Web System"
    }
  },
  WORKS: {
    SUMMARY: "list of websites and applications we have created so far.",
    CONTENTS: {
      OVERVIEW: "Overview",
      SPEC: "Spec"
    }
  },
  SERVICE: {
    SUMMARY:
      "We provide consistent services from hearing of requests to design, development, and maintenance, emphasize the following items in the development.",
    LIST: [
      "Designed for easy maintenance and scalability",
      "UI/UX conscious design",
      "Site performance"
    ],
    HOMEPAGE: {
      TITLE: "Home Page",
      SUMMARY:
        "Produce websites according to the purpose and scale of the project.",
      DETAIL: [
        "Design mobile-first screens. Tune your site to improve site speed, SEO, and other performance aspects. We can also implement a CMS such as WordPress or Drupal."
      ]
    },
    EC: {
      TITLE: "E-commerce Site",
      SUMMARY:
        "Build e-commerce site that allows you to select products and make payments within the site. Implement account functions to enhance the convenience of your site.",
      DETAIL: [
        "Design and implementation will be based on experience in developing medium-sized e-commerce site with 150,000 PV per month. We build secure and robust sites for a variety of hacking methods. It is also possible to use Shopify to reduce development costs."
      ]
    },
    SYSTEM: {
      TITLE: "Business Web System",
      SUMMARY:
        "Build original web systems specialized for your business. We select the method and technology after hearing your requirements.",
      DETAIL: [
        "Build web systems that can be accessed by PC, tablet, and smartphone. We can also integrate with existing systems. Servers can be selected from on-premise, cloud, and other options depending on the application. Recommend cloud servers for flexibility as your business expands."
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
