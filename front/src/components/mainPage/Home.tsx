import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Axios from "../../apis/Axios";
import MainPageStyle from "../../styles/MainPage";
import Hashtag from "../../functions/reactQuery/Hashtag";
import IsMobile from "../../functions/IsMobile";
import User from "../../functions/reactQuery/User";
import ComposePostButton from "../common/ComposePostButton";
import FloatingActionBar from "../layout/FloatingActionBar";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SearchIcon from "@mui/icons-material/Search";
import HomeIntro from "./HomeIntro";
import PopularTagsSidebar from "./PopularTagsSidebar";
import PostInfiniteList from "./PostInfiniteList";
import { scrollToTextWrapperBottom } from "./scrollMainPageText";
import TopPostsSection from "./TopPostsSection";
import { useMainBoardUrlSearch } from "./useMainBoardUrlSearch";

const Home = () => {
  const scrollTarget = useRef<HTMLDivElement>(null);
  const pillSub = ["Notice"];
  const [toggle, setToggle] = useState<number>(0);
  const [searchNotice, setSearchNotice] = useState<string>("");

  const navigate = useNavigate();
  const isMobile = IsMobile();
  const user = User.get().data;
  const tipHashtag = Hashtag.get({ type: 1, limit: 5 }).data;
  const freeHashtag = Hashtag.get({ type: 2, limit: 5 }).data;

  const topPosts = useQuery(["topPosts-all"], () =>
    Axios.get("post/month/top", { params: { type: [1, 2] } }).then((v) => v.data)
  ).data?.filter((v: { LikeCount: number }) => v.LikeCount !== 0);

  const searchNoticePosts = useInfiniteQuery(
    ["searchNoticePosts"],
    ({ pageParam = 1 }) => {
      if (searchNotice.length >= 1)
        return Axios.get("post/search", { params: { type: 0, search: searchNotice, pageParam, tempDataNum: 5 } }).then(
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

  const noticePosts = useInfiniteQuery(
    ["noticePosts"],
    ({ pageParam = 1 }) =>
      Axios.get("post", { params: { type: 0, pageParam, tempDataNum: 5 } }).then((res) => res.data),
    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === 0 ? undefined : allPages.length + 1;
      }
    }
  );

  useMainBoardUrlSearch({
    scrollTarget,
    searchTabIndex: 1,
    setToggle,
    setSearchQuery: setSearchNotice,
    refetchSearch: () => searchNoticePosts.refetch()
  });

  return (
    <MainPageStyle.MainEl>
      <FloatingActionBar>
        <ComposePostButton postType={0} />
      </FloatingActionBar>
      <MainPageStyle.TextWrapper ref={scrollTarget}>
        <HomeIntro nickname={user?.nickname} />

        {topPosts && topPosts.length >= 1 && (
          <>
            <MainPageStyle.Space height={48} />
            <MainPageStyle.TextWrapper_Bold>
              <CalendarMonthIcon id="icon" fontSize="large" />
              This Month
            </MainPageStyle.TextWrapper_Bold>
            <MainPageStyle.Space height={8} />
          </>
        )}

        <TopPostsSection posts={topPosts} subTitle="Popular Posts" />

        <MainPageStyle.Space height={12} />
      </MainPageStyle.TextWrapper>
      <MainPageStyle.Pill.Wrapper>
        {pillSub.map((v, i) => (
          <MainPageStyle.Pill.Sub
            key={i}
            toggle={toggle}
            onClick={() => {
              setToggle(i);
              navigate({
                pathname: "/main/0"
              });
              scrollToTextWrapperBottom(scrollTarget);
            }}
          >
            {v}
          </MainPageStyle.Pill.Sub>
        ))}

        <MainPageStyle.Pill.Search
          toggle={toggle === 1}
          onClick={() => {
            setToggle(1);
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchNotice.length !== 0) {
                navigate({
                  pathname: "/main/0",
                  search: `?search=${searchNotice}`
                });
              } else toast.error(`검색어는 최소 1글자 이상 필요합니다.`);
            }}
          >
            <SearchIcon />
            <input
              value={searchNotice}
              onChange={(e) => {
                setSearchNotice(e.target.value);
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
              data={noticePosts.data}
              hasNextPage={noticePosts.hasNextPage}
              fetchNextPage={() => noticePosts.fetchNextPage()}
              emptyMessage="포스트가 존재하지 않습니다."
            />
          )}
          {toggle === 1 && (
            <PostInfiniteList
              data={searchNoticePosts.data}
              hasNextPage={searchNoticePosts.hasNextPage}
              fetchNextPage={() => searchNoticePosts.fetchNextPage()}
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
                tagMaxLen: 10,
                onTagClick: (name) => navigate(`/main/1/search/#${encodeURI(name)}`)
              },
              {
                subTitle: "Free Posts",
                tags: freeHashtag,
                tagMaxLen: 10,
                onTagClick: (name) => navigate(`/main/2/search/#${encodeURI(name)}`)
              }
            ]}
          />
        )}
      </MainPageStyle.HomeEl>
    </MainPageStyle.MainEl>
  );
};

export default Home;
