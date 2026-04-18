import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Axios from "../../apis/Axios";
import MainPageStyle from "../../styles/MainPage";
import Hashtag from "../../functions/reactQuery/Hashtag";
import IsMobile from "../../functions/IsMobile";
import User from "../../functions/reactQuery/User";
import ComposePostButton from "../../components/common/ComposePostButton";
import FloatingActionBar from "../../components/layout/FloatingActionBar";
import SearchIcon from "@mui/icons-material/Search";
import FreeBoardIntro from "./FreeBoardIntro";
import MonthUploadCollapsible from "../../components/shared/MonthUploadCollapsible";
import PopularTagsSidebar from "../../components/shared/PopularTagsSidebar";
import PostInfiniteList from "../../components/shared/PostInfiniteList";
import { scrollToTextWrapperBottom } from "../../components/shared/scrollBoardText";
import TopPostsSection from "../../components/shared/TopPostsSection";
import { useMainBoardUrlSearch } from "../../hooks/useMainBoardUrlSearch";
import { PATH_FREE } from "../../routes/boardPaths";

const FreeBoard = () => {
  const navigate = useNavigate();
  const isMobile = IsMobile();
  const [postCountOpen, setPostCountOpen] = useState<boolean>(false);
  const scrollTarget = useRef<HTMLDivElement>(null);
  const [toggle, setToggle] = useState<number>(0);
  const [searchComm, setSearchComm] = useState<string>("");

  const freeHashtag = Hashtag.get({ type: 2, limit: 10 }).data;
  const user = User.get().data;
  const pillSub = user ? (["All", "Feed"] as const) : (["All"] as const);

  const monthNew = useQuery(["month/new/2"], () =>
    Axios.get("post/month/new", { params: { type: 2 } }).then((v) => v.data)
  ).data;
  const monthFeed = useQuery(
    ["month/feed", 2],
    () => Axios.get("post/month/feed", { params: { type: 2 } }).then((v) => v.data),
    { enabled: !!user }
  ).data;
  const topPosts = useQuery(["topPosts-free"], () =>
    Axios.get("post/month/top", { params: { type: 2 } }).then((v) => v.data)
  ).data?.filter((v: { LikeCount: number }) => v.LikeCount !== 0);

  const communityPosts = useInfiniteQuery(
    ["communityPosts"],
    ({ pageParam = 1 }) =>
      Axios.get("post", { params: { type: 2, pageParam, tempDataNum: 5 } }).then((res) => res.data),
    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === 0 ? undefined : allPages.length + 1;
      }
    }
  );
  const feedPosts = useInfiniteQuery(
    ["freefeed"],
    ({ pageParam = 1 }) =>
      Axios.get("post/feed", { params: { type: 2, pageParam, tempDataNum: 5 } }).then((res) => res.data),
    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === 0 ? undefined : allPages.length + 1;
      },
      enabled: !!user
    }
  );
  const searchCommPosts = useInfiniteQuery(
    ["searchComm"],
    ({ pageParam = 1 }) => {
      if (searchComm.length >= 1)
        return Axios.get("post/search", { params: { type: 2, search: searchComm, pageParam, tempDataNum: 5 } }).then(
          (res) => res.data
        );
      else return [];
    },
    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === 0 ? undefined : allPages.length + 1;
      },
      refetchOnWindowFocus: false,
      enabled: true
    }
  );

  useMainBoardUrlSearch({
    scrollTarget,
    searchTabIndex: 2,
    setToggle,
    setSearchQuery: setSearchComm,
    refetchSearch: () => searchCommPosts.refetch()
  });

  useEffect(() => {
    if (!user && toggle === 1) setToggle(0);
  }, [user, toggle]);

  return (
    <MainPageStyle.MainEl>
      <FloatingActionBar>
        <ComposePostButton postType={2} />
      </FloatingActionBar>
      <MainPageStyle.TextWrapper ref={scrollTarget}>
        <FreeBoardIntro />

        <MonthUploadCollapsible
          onToggle={() => setPostCountOpen((c) => !c)}
          showStats={postCountOpen || (topPosts?.length ?? 0) === 0}
        >
          <MainPageStyle.TextWrapper_SubBold>New Upload</MainPageStyle.TextWrapper_SubBold>
          <MainPageStyle.TextWrapper_Normal>
            Free {monthNew}
            {user ? ` • Feed Posts ${monthFeed ?? "-"}` : ""}
          </MainPageStyle.TextWrapper_Normal>
        </MonthUploadCollapsible>

        <TopPostsSection posts={topPosts} subTitle="Popular Free Posts" likeIcon="favorite" />

        <MainPageStyle.Space height={12} />
      </MainPageStyle.TextWrapper>
      <MainPageStyle.Pill.Wrapper>
        {pillSub.map((v, i) => (
          <MainPageStyle.Pill.Sub
            key={v}
            toggle={toggle}
            onClick={() => {
              setToggle(i);
              navigate({
                pathname: PATH_FREE
              });
              scrollToTextWrapperBottom(scrollTarget);
            }}
          >
            {v}
          </MainPageStyle.Pill.Sub>
        ))}

        <MainPageStyle.Pill.Search
          toggle={toggle === 2}
          onClick={() => {
            setToggle(2);
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchComm.length !== 0) {
                navigate({
                  pathname: PATH_FREE,
                  search: `?search=${searchComm}`
                });
              } else toast.error(`검색어는 최소 1글자 이상 필요합니다.`);
            }}
          >
            <SearchIcon />
            <input
              placeholder="검색"
              value={searchComm}
              onChange={(e) => {
                setSearchComm(e.target.value);
              }}
            />
          </form>
        </MainPageStyle.Pill.Search>
      </MainPageStyle.Pill.Wrapper>
      <MainPageStyle.HomeEl>
        <div id="posts">
          {toggle === 0 && (
            <PostInfiniteList
              data={communityPosts.data}
              hasNextPage={communityPosts.hasNextPage}
              fetchNextPage={() => communityPosts.fetchNextPage()}
              emptyMessage="포스트가 존재하지 않습니다."
            />
          )}
          {toggle === 1 && (
            <PostInfiniteList
              data={feedPosts.data}
              hasNextPage={feedPosts.hasNextPage}
              fetchNextPage={() => feedPosts.fetchNextPage()}
              emptyMessage="포스트가 존재하지 않습니다."
            />
          )}
          {toggle === 2 && (
            <PostInfiniteList
              data={searchCommPosts.data}
              hasNextPage={searchCommPosts.hasNextPage}
              fetchNextPage={() => searchCommPosts.fetchNextPage()}
              emptyMessage="검색 결과가 존재하지 않습니다."
            />
          )}
        </div>
        {!isMobile && (
          <PopularTagsSidebar
            sections={[
              {
                subTitle: "Free Posts",
                tags: freeHashtag,
                tagMaxLen: 10,
                onTagClick: (name) => navigate(`${PATH_FREE}/search/#${encodeURI(name)}`)
              }
            ]}
          />
        )}
      </MainPageStyle.HomeEl>
    </MainPageStyle.MainEl>
  );
};

export default FreeBoard;
