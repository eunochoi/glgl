import { useEffect, useRef, type Dispatch, type RefObject, type SetStateAction } from "react";
import { useLocation } from "react-router-dom";

export interface UseMainBoardUrlSearchOptions {
  scrollTarget: RefObject<HTMLDivElement | null>;
  /** 해시·?search= 진입 시 검색 탭으로 쓸 toggle 값 */
  searchTabIndex: number;
  setToggle: Dispatch<SetStateAction<number>>;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  refetchSearch: () => unknown;
  /** Tips 전용: 해시 진입 후 pill 가로 스크롤 */
  pillWrapperRef?: RefObject<HTMLElement | null>;
}

/**
 * ?search= 쿼리 / #해시로 들어온 경우 검색어·탭·스크롤·refetch 맞춤
 * (라우터 hash 변경은 location.hash 구독으로 처리 — window.location.hash 의존 제거)
 */
export function useMainBoardUrlSearch({
  scrollTarget,
  searchTabIndex,
  setToggle,
  setSearchQuery,
  refetchSearch,
  pillWrapperRef
}: UseMainBoardUrlSearchOptions) {
  const { search, hash } = useLocation();

  // refetchSearch를 인라인으로 넘기면 매 렌더마다 참조가 바뀌어 ?search= 동기화 이펙트가 반복 실행되고 입력값이 URL로 되살아남
  const refetchSearchRef = useRef(refetchSearch);
  refetchSearchRef.current = refetchSearch;

  useEffect(() => {
    if (!search) return;
    const raw = search.split("?search=")[1];
    if (raw === undefined) return;
    const query = decodeURI(raw);
    setTimeout(() => {
      setSearchQuery(query);
      window.scrollTo({
        top: scrollTarget.current?.scrollHeight,
        left: 0,
        behavior: "smooth"
      });
    }, 100);
    setTimeout(() => {
      refetchSearchRef.current();
    }, 200);
  }, [search, scrollTarget, setSearchQuery]);

  useEffect(() => {
    const decoded = decodeURI(hash);
    if (!decoded) return;
    setTimeout(() => {
      setToggle(searchTabIndex);
      setSearchQuery(decoded);
      window.scrollTo({
        top: scrollTarget.current?.scrollHeight,
        left: 0,
        behavior: "smooth"
      });
    }, 100);
    setTimeout(() => {
      refetchSearchRef.current();
    }, 200);
    if (pillWrapperRef) {
      setTimeout(() => {
        pillWrapperRef.current?.scrollTo({
          top: 0,
          left: window.visualViewport?.width,
          behavior: "smooth"
        });
      }, 500);
    }
  }, [hash, scrollTarget, searchTabIndex, setToggle, setSearchQuery, pillWrapperRef]);
}
