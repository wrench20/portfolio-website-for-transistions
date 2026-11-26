import {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
} from "react";
import Loader from "../components/Loader";

interface LoadingType {
  isLoading: boolean;
  setIsLoading: (state: boolean) => void;
}

export const LoadingContext = createContext<LoadingType | null>(null);

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  // Every width gets the loader now. Phones used to skip it and fire initialFX() on a
  // timer instead, which also meant they never got the logo-window entrance; the loader
  // takes touch input for the dive, so there is no longer a reason to send them around it.
  // The loader itself calls revealSite()/unlockScroll(), so nothing needs starting here.
  const [isLoading, setIsLoading] = useState(true);

  const value = {
    isLoading,
    setIsLoading,
  };

  return (
    <LoadingContext.Provider value={value as LoadingType}>
      {isLoading && <Loader />}
      <main className="main-body">{children}</main>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
