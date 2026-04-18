import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Axios from "../../apis/Axios";
import MainPageStyle from "../../styles/MainPage";
import Hashtag from "../../functions/reactQuery/Hashtag";
import IsMobile from "../../functions/IsMobile";
import User from "../../functions/reactQuery/User";
import ComposePostButton from "../common/ComposePostButton";
import FloatingActionBar from "../layout/FloatingActionBar";
import SearchIcon from "@mui/icons-material/Search";
import MonthUploadCollapsible from "./MonthUploadCollapsible";
import PopularTagsSidebar from "./PopularTagsSidebar";
import PostInfiniteList from "./PostInfiniteList";
import { scrollToTextWrapperBottom } from "./scrollMainPageText";
import TipsIntro from "./TipsIntro";
import TopPostsSection from "./TopPostsSection";
import { useMainBoardUrlSearch } from "./useMainBoardUrlSearch";

const Tips = () => {
  const navigate = useNavigate();
  const scrollTarget = useRef<HTMLDivElement>(null);
  const pillWrapperRef = useRef<HTMLInputElement>(null);

  const isMobile = IsMobile();
  const [postCountOpen, setPostCountOpen] = useState<boolean>(false);
  const [toggle, setToggle] = useState<number>(0);
  const [searchInfo, setSearchInfo] = useState<string>("");

  const tipHashtag = Hashtag.get({ type: 1, limit: 10 }).data;
  const user = User.get().data;
  const pillSub = user ? (["All", "Ongoing", "Feed"] as const) : (["All", "Ongoing"] as const);

  const monthNewInfo = useQuery(["month/new/1"], () =>
    Axios.get("post/month/new", { params: { type: 1 } }).then((v) => v.data)
  ).data;
  const monthFeed = useQuery(
    ["month/feed", 1],
    () => Axios.get("post/month/feed", { params: { type: 1 } }).then((v) => v.data),
    { enabled: !!user }
  ).data;
  const monthOngoing = useQuery(["month/activeinfo"], () =>
    Axios.get("post/month/activeinfo", { params: { type: 1 } }).then((v) => v.data)
  ).data;
  const topPosts = useQuery(["topPosts-tip"], () =>
    Axios.get("post/month/top", { params: { type: [1] } }).then((v) => v.data)
  ).data?.filter((v: { LikeCount: number }) => v.LikeCount !== 0);

  const infoPosts = useInfiniteQuery(
    ["infoPosts"],
    ({ pageParam = 1 }) =>
      Axios.get("post", { params: { type: 1, pageParam, tempDataNum: 5 } }).then((res) => res.data),
    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === 0 ? undefined : allPages.length + 1;
      }
    }
  );
  const activInfo = useInfiniteQuery(
    ["activinfo"],
    ({ pageParam = 1 }) =>
      Axios.get("post/activinfo", { params: { type: 1, pageParam, tempDataNum: 5 } }).then((res) => res.data),
    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === 0 ? undefined : allPages.length + 1;
      }
    }
  );
  const feedPosts = useInfiniteQuery(
    ["tipfeed"],
    ({ pageParam = 1 }) =>
      Axios.get("post/feed", { params: { type: 1, pageParam, tempDataNum: 5 } }).then((res) => res.data),
    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === 0 ? undefined : allPages.length + 1;
      },
      enabled: !!user
    }
  );
  const searchInfoPosts = useInfiniteQuery(
    ["searchInfo"],
    ({ pageParam = 1 }) => {
      if (searchInfo.length >= 1)
        return Axios.get("post/search", { params: { type: 1, search: searchInfo, pageParam, tempDataNum: 5 } }).then(
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
    searchTabIndex: 3,
    setToggle,
    setSearchQuery: setSearchInfo,
    refetchSearch: () => searchInfoPosts.refetch(),
    pillWrapperRef
  });

  useEffect(() => {
    if (!user && toggle === 2) setToggle(0);
  }, [user, toggle]);

  return (
    <MainPageStyle.MainEl>
      <FloatingActionBar>
        <ComposePostButton postType={1} />
      </FloatingActionBar>
      <MainPageStyle.TextWrapper ref={scrollTarget}>
        <TipsIntro />

        <MonthUploadCollapsible
          onToggle={() => setPostCountOpen((c) => !c)}
          showStats={postCountOpen || (topPosts?.length ?? 0) === 0}
        >
          <MainPageStyle.TextWrapper_SubBold>New Upload</MainPageStyle.TextWrapper_SubBold>
          <MainPageStyle.TextWrapper_Normal>
            Tip {monthNewInfo} • Ongoing {monthOngoing}• Feed Posts {monthFeed ?? "-"}
          </MainPageStyle.TextWrapper_Normal>
        </MonthUploadCollapsible>

        <TopPostsSection posts={topPosts} subTitle="Popular Tip Posts" />

        <MainPageStyle.Space height={12} />
      </MainPageStyle.TextWrapper>
      <MainPageStyle.Pill.Wrapper ref={pillWrapperRef}>
        {pillSub.map((v, i) => (
          <MainPageStyle.Pill.Sub
            key={v}
            toggle={toggle}
            onClick={() => {
              setToggle(i);
              navigate({
                pathname: "/main/1"
              });
              scrollToTextWrapperBottom(scrollTarget);
            }}
          >
            {v}
          </MainPageStyle.Pill.Sub>
        ))}

        <MainPageStyle.Pill.Search
          toggle={toggle === 3}
          onClick={() => {
            setToggle(3);
            setTimeout(() => {
              pillWrapperRef.current?.scrollTo({
                top: 0,
                left: window.visualViewport?.width,
                behavior: "smooth"
              });
            }, 500);
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchInfo.length !== 0) {
                navigate({
                  pathname: "/main/1",
                  search: `?search=${searchInfo}`
                });
              } else toast.error(`검색어는 최소 1글자 이상 필요합니다.`);
            }}
          >
            <SearchIcon />
            <input
              value={searchInfo}
              onChange={(e) => {
                setSearchInfo(e.target.value);
              }}
              placeholder="검색"
            />
          </form>
        </MainPageStyle.Pill.Search>
      </MainPageStyle.Pill.Wrapper>
      <MainPageStyle.HomeEl>
        <div id="posts">
          {toggle === 0 && (
            <PostInfiniteList
              data={infoPosts.data}
              hasNextPage={infoPosts.hasNextPage}
              fetchNextPage={() => infoPosts.fetchNextPage()}
              emptyMessage="포스트가 존재하지 않습니다."
            />
          )}
          {toggle === 1 && (
            <PostInfiniteList
              data={activInfo.data}
              hasNextPage={activInfo.hasNextPage}
              fetchNextPage={() => activInfo.fetchNextPage()}
              emptyMessage="포스트가 존재하지 않습니다."
            />
          )}
          {toggle === 2 && (
            <PostInfiniteList
              data={feedPosts.data}
              hasNextPage={feedPosts.hasNextPage}
              fetchNextPage={() => feedPosts.fetchNextPage()}
              emptyMessage="포스트가 존재하지 않습니다."
            />
          )}
          {toggle === 3 && (
            <PostInfiniteList
              data={searchInfoPosts.data}
              hasNextPage={searchInfoPosts.hasNextPage}
              fetchNextPage={() => searchInfoPosts.fetchNextPage()}
              emptyMessage="검색 결과가 존재하지 않습니다."
            />
          )}
        </div>
        {!isMobile && (
          <PopularTagsSidebar
            sections={[
              {
                subTitle: "Tip Posts",
                tags: tipHashtag,
                tagMaxLen: 9,
                onTagClick: (name) => navigate(`/main/1/search/#${encodeURI(name)}`)
              }
            ]}
          />
        )}
      </MainPageStyle.HomeEl>
    </MainPageStyle.MainEl>
  );
};

export default Tips;
