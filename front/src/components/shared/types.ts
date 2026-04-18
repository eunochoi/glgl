export interface MainPageUser {
  email: string;
  id: number;
  nickname: string;
}

export interface MainPageImage {
  src: string;
}

export interface PostProps {
  User: MainPageUser;
  Images: MainPageImage[];
  content: string;
  createdAt: string;
}

/** 인기글 카드용 — API month/top 응답 최소 필드 */
export interface TopPostItem {
  id: number;
  Images: { src: string }[];
  content: string;
  LikeCount: number;
  Comments: { id: number }[];
}
