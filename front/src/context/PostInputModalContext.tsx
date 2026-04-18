import { createContext } from "react";

export interface PostInputModalContextValue {
  postInputOpen: boolean;
  setPostInputOpen: (b: boolean) => void;
}

export const PostInputModalContext = createContext<PostInputModalContextValue | null>(null);
