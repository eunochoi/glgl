import InfiniteScroll from "react-infinite-scroll-component";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import CircularProgress from "@mui/material/CircularProgress";
import MainPageStyle from "../../styles/MainPage";
import Post from "../common/Post";
import type { PostProps } from "./types";

interface PostInfiniteListProps {
  /** pages[0] 없을 때도 빈 목록으로 처리 */
  data: { pages: PostProps[][] } | undefined;
  hasNextPage: boolean | undefined;
  fetchNextPage: () => unknown;
  emptyMessage: string;
}

const PostInfiniteList = ({ data, hasNextPage, fetchNextPage, emptyMessage }: PostInfiniteListProps) => {
  const total = data?.pages?.reduce((acc, page) => acc + page.length, 0) ?? 0;
  // data 없을 때는 로딩으로 보고 빈 안내 숨김 (기존 data?.pages[0] 패턴과 동일한 의도)
  const showEmpty = data?.pages?.[0]?.length === 0;

  return (
    <>
      {showEmpty && (
        <MainPageStyle.EmptyNoti>
          <SentimentVeryDissatisfiedIcon fontSize="inherit" />
          <span>{emptyMessage}</span>
        </MainPageStyle.EmptyNoti>
      )}
      <InfiniteScroll
        hasMore={hasNextPage || false}
        loader={
          <MainPageStyle.LoadingIconWrapper>
            <CircularProgress size={96} color="inherit" />
          </MainPageStyle.LoadingIconWrapper>
        }
        next={() => fetchNextPage()}
        dataLength={total}
      >
        {data?.pages?.map((p) => p.map((v: PostProps, i: number) => <Post key={"post" + i} postProps={v} />))}
      </InfiniteScroll>
    </>
  );
};

export default PostInfiniteList;
