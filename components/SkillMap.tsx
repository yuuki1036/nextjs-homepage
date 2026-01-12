"use client";

import * as am5 from "@amcharts/amcharts5";
import * as am5hierarchy from "@amcharts/amcharts5/hierarchy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { SKILL_MAP_DATA } from "lib/constants";
import { useLayoutEffect } from "react";

const SkillMap = () => {
  useLayoutEffect(() => {
    // Create root element
    const root = am5.Root.new("chartdiv");
    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);
    // Create wrapper container
    const container = root.container.children.push(
      am5.Container.new(root, {
        width: am5.percent(100),
        height: am5.percent(100),
        layout: root.verticalLayout
      })
    );
    // Create series
    const series = container.children.push(
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
    series.get("colors")?.setAll({
      step: 2
    });
    series.links.template.set("strength", 0.5);
    series.data.setAll([SKILL_MAP_DATA]);
    series.set("selectedDataItem", series.dataItems[0]);
    // Make stuff animate on load
    series.appear(1000, 100);

    return () => root.dispose();
  }, []);

  return <div id="chartdiv" className="w-full h-[25rem] md:h-[35rem] dark-image-layer"></div>;
};

export default SkillMap;
