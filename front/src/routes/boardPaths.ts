/** 메인 보드 URL (예전 main/:type 대체) */
export const PATH_HOME = "/home";
export const PATH_TIP = "/tip";
export const PATH_FREE = "/free";
export const PATH_GALLERY = "/gallery";

export function profilePath(cat: number | string) {
  return `/profile/${cat}`;
}

/** 레거시 /main/:type → 새 경로 */
export const LEGACY_TYPE_TO_BASE: Record<string, string> = {
  "0": PATH_HOME,
  "1": PATH_TIP,
  "2": PATH_FREE,
  "3": PATH_GALLERY,
  "4": "/profile/0"
};

/** PostZoom 등 — API post.type → 검색 경로 prefix */
export function postTypeToSearchBasePath(postType: number): string {
  switch (postType) {
    case 0:
      return `${PATH_HOME}/search`;
    case 1:
      return `${PATH_TIP}/search`;
    case 2:
      return `${PATH_FREE}/search`;
    default:
      return `${PATH_HOME}/search`;
  }
}

function firstSegment(pathname: string): string | undefined {
  return pathname.split("/").filter(Boolean)[0];
}

/** 글 작성 팝업 — 현재 경로에서 post type (0·1·2) 추정 */
export function getPostInputTypeFromPath(pathname: string): number {
  const seg = firstSegment(pathname);
  if (seg === "tip") return 1;
  if (seg === "free") return 2;
  if (seg === "home") return 0;
  return 0;
}

/**
 * 사이드바·헤더 활성 인덱스 (기존 main/:type 숫자와 동일: 0~4)
 * LoginMenu currentPage={currentPage + 1} 유지용
 */
export function navBoardIndexFromPath(pathname: string): number {
  const seg = firstSegment(pathname);
  if (seg === "profile") return 4;
  if (seg === "tip") return 1;
  if (seg === "free") return 2;
  if (seg === "gallery") return 3;
  if (seg === "home") return 0;
  return -1;
}
