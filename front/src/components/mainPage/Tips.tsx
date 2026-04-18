import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import Axios from "../../apis/Axios";
import { toast } from "react-toastify";
import MainPageStyle from "../../styles/MainPage";

//components
import Post from "../common/Post";
import FloatingActionBar from "../layout/FloatingActionBar";
import ComposePostButton from "../common/ComposePostButton";
import Img from "../common/Img";

//mui
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import CircularProgress from "@mui/material/CircularProgress";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import MessageIcon from "@mui/icons-material/Message";
import IsMobile from "../../functions/IsMobile";
import Hashtag from "../../functions/reactQuery/Hashtag";
import User from "../../functions/reactQuery/User";

interface userProps {
  email: string;
  id: number;
  nickname: string;
}
interface imageProps {
  src: string;
}

interface postProps {
  User: userProps;
  Images: imageProps[];
  content: string;
  createdAt: string;
}

const Tips = () => {
  const navigate = useNavigate();
  const scrollTarget = useRef<HTMLDivElement>(null);

  const isMobile = IsMobile();

  const [postCountOpen, setPostCountOpen] = useState<boolean>(false);
  const [toggle, setToggle] = useState<number>(0);
  const [searchInfo, setSearchInfo] = useState<string>("");
  const pillWrapperRef = useRef<HTMLInputElement>(null);

  const { search } = useLocation();

  //검색
  useEffect(() => {
    if (search) {
      console.log(search);
      const query = decodeURI(search.split("?search=")[1]);
      setTimeout(() => {
        // setToggle(3);
        setSearchInfo(query);
        window.scrollTo({
          top: scrollTarget.current?.scrollHeight,
          left: 0,
          behavior: "smooth"
        });
      }, 100);
      setTimeout(() => {
        searchInfoPosts.refetch();
      }, 200);
    }
  }, [search]);

  //태그 클릭
  useEffect(() => {
    const hash = decodeURI(window.location.hash);
    if (hash) {
      console.log(decodeURI(window.location.hash));
      setTimeout(() => {
        setToggle(3);
        setSearchInfo(hash);
        window.scrollTo({
          top: scrollTarget.current?.scrollHeight,
          left: 0,
          behavior: "smooth"
        });
      }, 100);
      setTimeout(() => {
        searchInfoPosts.refetch();
      }, 200);
      setTimeout(() => {
        pillWrapperRef.current?.scrollTo({
          top: 0,
          left: window.visualViewport?.width,
          behavior: "smooth"
        });
      }, 500);
    }
  }, [window.location.hash]);

  //scroll when pill click
  const scrollTargerheight = () => {
    const height = scrollTarget.current?.scrollHeight;

    if (height && height < window?.scrollY) {
      window.scrollTo({
        top: scrollTarget.current?.scrollHeight,
        left: 0,
        behavior: "smooth"
      });
    }
  };

  const tipHashtag = Hashtag.get({ type: 1, limit: 10 }).data;
  const user = User.get().data;
  const pillSub = user ? (["All", "Ongoing", "Feed"] as const) : (["All", "Ongoing"] as const);

  //this month
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

  //load posts
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
  //load feed posts
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
  //load search posts
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

  useEffect(() => {
    if (!user && toggle === 2) setToggle(0);
  }, [user, toggle]);

  const shortTag = (tag: string) => {
    if (tag?.length >= 10) return tag.slice(0, 9) + "...";
    else return tag;
  };
  const makeK = (n: number | null) => {
    if (n === null) {
      return null;
    }
    if (n > 1000) {
      return (n / 1000).toFixed(1) + "k";
    }
    return n;
  };

  return (
    <MainPageStyle.MainEl>
      <FloatingActionBar>
        <ComposePostButton postType={1} />
      </FloatingActionBar>
      <MainPageStyle.TextWrapper ref={scrollTarget}>
        <MainPageStyle.TextWrapper_Title>Tip Board</MainPageStyle.TextWrapper_Title>

        <MainPageStyle.Space height={16}></MainPageStyle.Space>

        <MainPageStyle.TextWrapper_Normal>팁과 설정을 공유하고 배우는 게시판입니다.</MainPageStyle.TextWrapper_Normal>
        <MainPageStyle.TextWrapper_Normal>GTS와 드랍십을 활용해보세요!</MainPageStyle.TextWrapper_Normal>

        <MainPageStyle.Space height={48}></MainPageStyle.Space>

        <MainPageStyle.TextWrapper_Bold onClick={() => setPostCountOpen((c) => !c)}>
          <CalendarMonthIcon id="icon" fontSize="large" />
          This Month
        </MainPageStyle.TextWrapper_Bold>
        <MainPageStyle.Space height={8} />

        {(postCountOpen || topPosts?.length === 0) && (
          <>
            <MainPageStyle.TextWrapper_SubBold>New Upload</MainPageStyle.TextWrapper_SubBold>
            <MainPageStyle.TextWrapper_Normal>
              Tip {monthNewInfo} • Ongoing {monthOngoing}• Feed Posts {monthFeed ?? "-"}
            </MainPageStyle.TextWrapper_Normal>
          </>
        )}

        {topPosts?.length >= 1 && (
          <>
            {/* <MainPageStyle.Space height={8} /> */}
            <MainPageStyle.TextWrapper_SubBold>Popular Tip Posts</MainPageStyle.TextWrapper_SubBold>
            <MainPageStyle.TopWrapper>
              {topPosts?.map(
                (
                  v: {
                    Images: Array<{ src: string }>;
                    content: string;
                    LikeCount: number;
                    id: number;
                    Comments: Array<{ id: number }>;
                  },
                  i: number
                ) => (
                  <MainPageStyle.TopPostWrapper key={i}>
                    <MainPageStyle.TopPost
                      onClick={() => {
                        // console.log(v);
                        navigate(`/postview/${v?.id}`);
                      }}
                    >
                      {v?.Images?.length >= 1 ? (
                        <Img alt="TopImage" id="image" src={v?.Images[0].src} />
                      ) : (
                        <span id="text">{v?.content}</span>
                      )}
                    </MainPageStyle.TopPost>
                    <div id="info">
                      <span>#{i + 1}</span>
                      <span>
                        <BookmarkIcon id="icon" fontSize="inherit" /> {makeK(v?.LikeCount)}
                      </span>
                      <span>
                        <MessageIcon id="icon" fontSize="inherit" /> {makeK(v?.Comments?.length)}
                      </span>
                    </div>
                  </MainPageStyle.TopPostWrapper>
                )
              )}
            </MainPageStyle.TopWrapper>
          </>
        )}

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
              scrollTargerheight();
            }}
          >
            {v}
          </MainPageStyle.Pill.Sub>
        ))}

        <MainPageStyle.Pill.Search
          toggle={toggle === 3}
          onClick={() => {
            setToggle(3);
            // window.scrollTo({
            //   top: scrollTarget.current?.scrollHeight,
            //   left: 0,
            //   behavior: "smooth"
            // });
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
          {toggle === 0 && ( //팁&설정 포스트
            <>
              {infoPosts.data?.pages[0].length === 0 && (
                <MainPageStyle.EmptyNoti>
                  <SentimentVeryDissatisfiedIcon fontSize="inherit" />
                  <span>포스트가 존재하지 않습니다.</span>
                </MainPageStyle.EmptyNoti>
              )}
              <InfiniteScroll
                // scrollableTarget="scrollWrapper"
                hasMore={infoPosts.hasNextPage || false}
                loader={
                  <MainPageStyle.LoadingIconWrapper>
                    <CircularProgress size={96} color="inherit" />
                  </MainPageStyle.LoadingIconWrapper>
                }
                next={() => infoPosts.fetchNextPage()}
                dataLength={infoPosts.data?.pages.reduce((total, page) => total + page.length, 0) || 0}
              >
                {infoPosts?.data?.pages.map((p) =>
                  p.map((v: postProps, i: number) => <Post key={"post" + i} postProps={v} />)
                )}
              </InfiniteScroll>
            </>
          )}
          {toggle === 1 && (
            <>
              {activInfo.data?.pages[0].length === 0 && (
                <MainPageStyle.EmptyNoti>
                  <SentimentVeryDissatisfiedIcon fontSize="inherit" />
                  <span>포스트가 존재하지 않습니다.</span>
                </MainPageStyle.EmptyNoti>
              )}
              <InfiniteScroll
                // scrollableTarget="scrollWrapper"
                hasMore={activInfo.hasNextPage || false}
                loader={
                  <MainPageStyle.LoadingIconWrapper>
                    <CircularProgress size={96} color="inherit" />
                  </MainPageStyle.LoadingIconWrapper>
                }
                next={() => activInfo.fetchNextPage()}
                dataLength={activInfo.data?.pages.reduce((total, page) => total + page.length, 0) || 0}
              >
                {activInfo?.data?.pages.map((p) =>
                  p.map((v: postProps, i: number) => <Post key={"post" + i} postProps={v} />)
                )}
              </InfiniteScroll>
            </>
          )}
          {toggle === 2 && (
            <>
              {(feedPosts.data?.pages?.[0]?.length ?? 0) === 0 && (
                <MainPageStyle.EmptyNoti>
                  <SentimentVeryDissatisfiedIcon fontSize="inherit" />
                  <span>포스트가 존재하지 않습니다.</span>
                </MainPageStyle.EmptyNoti>
              )}
              <InfiniteScroll
                // scrollableTarget="scrollWrapper"
                hasMore={feedPosts.hasNextPage || false}
                loader={
                  <MainPageStyle.LoadingIconWrapper>
                    <CircularProgress size={96} color="inherit" />
                  </MainPageStyle.LoadingIconWrapper>
                }
                next={() => feedPosts.fetchNextPage()}
                dataLength={feedPosts.data?.pages.reduce((total, page) => total + page.length, 0) || 0}
              >
                {feedPosts?.data?.pages.map((p) =>
                  p.map((v: postProps, i: number) => <Post key={"post" + i} postProps={v} />)
                )}
              </InfiniteScroll>
            </>
          )}
          {toggle === 3 && ( //모집 공고 검색
            <>
              {/* 검색 결과가 존재하지 않는 경우 */}
              {searchInfoPosts.data?.pages[0].length === 0 && (
                <MainPageStyle.EmptyNoti>
                  <SentimentVeryDissatisfiedIcon fontSize="inherit" />
                  <span>검색 결과가 존재하지 않습니다.</span>
                </MainPageStyle.EmptyNoti>
              )}

              <InfiniteScroll
                // scrollableTarget="scrollWrapper"
                hasMore={searchInfoPosts.hasNextPage || false}
                loader={
                  <MainPageStyle.LoadingIconWrapper>
                    <CircularProgress size={96} color="inherit" />
                  </MainPageStyle.LoadingIconWrapper>
                }
                next={() => searchInfoPosts.fetchNextPage()}
                dataLength={searchInfoPosts.data?.pages.reduce((total, page) => total + page.length, 0) || 0}
              >
                {searchInfoPosts?.data?.pages.map((p) =>
                  p.map((v: postProps, i: number) => <Post key={"post" + i} postProps={v} />)
                )}
              </InfiniteScroll>
            </>
          )}
        </div>
        {!isMobile && (
          <div id="tags">
            <span className="title">Popular Tag</span>
            <MainPageStyle.Space height={24} />
            <span className="subTitle">Tip Posts</span>
            {tipHashtag?.map((v: { id: number; name: string }) => (
              <span
                id="tagItem"
                key={v?.id}
                onClick={() => {
                  navigate(`/main/1/search/#${encodeURI(v?.name)}`);
                }}
              >
                #{shortTag(v?.name)}
              </span>
            ))}
          </div>
        )}
      </MainPageStyle.HomeEl>
    </MainPageStyle.MainEl>
  );
};

export default Tips;
