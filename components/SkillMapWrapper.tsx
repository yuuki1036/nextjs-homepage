"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const SkillMap = dynamic(() => import("components/SkillMap"), { ssr: false });

export default function SkillMapWrapper() {
  return (
    <Suspense fallback={null}>
      <div className="w-full h-[25rem] md:h-[35rem]">
        <SkillMap />
      </div>
    </Suspense>
  );
}
