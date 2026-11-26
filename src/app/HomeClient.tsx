"use client";

import dynamic from "next/dynamic";

const MainExperience = dynamic(() => import("./MainExperience"), {
  ssr: false,
});

export default function HomeClient() {
  return <MainExperience />;
}
