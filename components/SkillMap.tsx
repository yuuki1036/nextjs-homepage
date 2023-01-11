import * as am5 from "@amcharts/amcharts5";
import * as am5hierarchy from "@amcharts/amcharts5/hierarchy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { useLayoutEffect } from "react";

const data = {
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
      name: "Ruby",
      value: 1
    },
    {
      name: "C++",
      value: 1
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

const SkillMap = () => {
  useLayoutEffect(() => {
    let root = am5.Root.new("chartdiv");
    root.setThemes([am5themes_Animated.new(root)]);
    // Create wrapper container
    let container = root.container.children.push(
      am5.Container.new(root, {
        width: am5.percent(100),
        height: am5.percent(100),
        layout: root.verticalLayout
      })
    );

    // Create series
    // https://www.amcharts.com/docs/v5/charts/hierarchy/#Adding
    let series = container.children.push(
      am5hierarchy.ForceDirected.new(root, {
        singleBranchOnly: false,
        downDepth: 1,
        topDepth: 1,
        initialDepth: 2,
        valueField: "value",
        categoryField: "name",
        childDataField: "children",
        idField: "name",
        linkWithField: "linkWith",
        manyBodyStrength: -10,
        centerStrength: 0.8
      })
    );

    series.get("colors").setAll({
      step: 3
    });
    series.links.template.set("strength", 0.5);

    series.data.setAll([data]);

    series.set("selectedDataItem", series.dataItems[0]);

    // Make stuff animate on load
    series.appear(1000, 100);

    return () => root.dispose();
  }, []);

  return <div id="chartdiv" style={{ width: "100%", height: "600px" }}></div>;
};

export default SkillMap;
