import { TFeatureWorks } from "./types";

export const SITE_NAME: string = "yuuki1036";
export const MY_NAME: string = "yuuki1036";

export const IMAGE_BORDER_CLASS: string = "rounded-lg border-2 border-gray-300";
export const DARK_IMAGE_CLASS: string =
  "dark:saturate-[80%] dark:brightness-[80%]";

export const FEATURE_WORKS: TFeatureWorks[] = [
  {
    slug: "hitokoto",
    gradient: "from-[#D8B4FE] to-[#818CF8]"
  },
  {
    slug: "netfjix",
    gradient: "from-[#6EE7B7] via-[#3B82F6] to-[#9333EA]"
  },
  {
    slug: "53st",
    gradient: "from-[#FDE68A] via-[#FCA5A5] to-[#FECACA]"
  }
];

export const SKILL_MAP_DATA = {
  value: 0,
  children: [
    {
      name: "JavaScript",
      value: 2,
      children: [
        {
          name: "Node.js",
          value: 1
        },
        {
          name: "TypeScript",
          value: 1
        },
        {
          name: "JQuery",
          value: 1
        }
      ]
    },
    {
      name: "PHP",
      value: 2,
      children: [
        {
          name: "Laravel",
          value: 1
        }
      ]
    },
    {
      name: "Python",
      value: 2,
      children: [
        {
          name: "Django",
          value: 1
        }
      ]
    },
    {
      name: "HTML5",
      value: 1
    },
    {
      name: "FrontEnd",
      value: 2,
      children: [
        {
          name: "React",
          value: 1
        },
        {
          name: "Vue.js",
          value: 1
        },
        {
          name: "Express",
          value: 1
        }
      ]
    },
    {
      name: "CSS",
      value: 2,
      children: [
        {
          name: "BootStrap",
          value: 1
        },
        {
          name: "Tailwind CSS",
          value: 1
        },
        {
          name: "Material-UI",
          value: 1
        }
      ]
    },
    {
      name: "Git",
      value: 2,
      children: [
        {
          name: "GitHub",
          value: 1
        }
      ]
    },
    {
      name: "DB",
      value: 2,
      children: [
        {
          name: "MySQL",
          value: 1
        },
        {
          name: "PostgreSQL",
          value: 1
        },
        {
          name: "SQL Server",
          value: 1
        }
      ]
    },
    {
      name: "Cloud",
      value: 2,
      children: [
        {
          name: "AWS",
          value: 1
        },
        {
          name: "Heroku",
          value: 1
        },
        {
          name: "Firebase",
          value: 1
        },
        {
          name: "Vercel",
          value: 1
        }
      ]
    },
    {
      name: "Docker",
      value: 1
    },
    {
      name: "Travis CI",
      value: 1
    },
    {
      name: "CMS",
      value: 2,
      children: [
        {
          name: "WordPress",
          value: 1
        },
        {
          name: "Drupal",
          value: 1
        }
      ]
    }
  ]
};
