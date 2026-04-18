import { createContext } from "react";

export const MobileSideContext = createContext<{ openMobileSide: () => void } | null>(null);
