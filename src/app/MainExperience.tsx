"use client";

import { LoadingProvider } from "../context/LoadingProvider";
import MainContainer from "../components/MainContainer";

export default function MainExperience() {
  return (
    <LoadingProvider>
      <MainContainer />
    </LoadingProvider>
  );
}
