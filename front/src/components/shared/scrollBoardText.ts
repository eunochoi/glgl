import type { RefObject } from "react";

/** Pill 클릭 후 본문이 짧을 때 스크롤이 위에 남는 경우 아래로 맞춤 */
export function scrollToTextWrapperBottom(scrollTarget: RefObject<HTMLDivElement | null>) {
  const height = scrollTarget.current?.scrollHeight;

  if (height && height < window?.scrollY) {
    window.scrollTo({
      top: scrollTarget.current?.scrollHeight,
      left: 0,
      behavior: "smooth"
    });
  }
}
