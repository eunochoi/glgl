import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import Axios from "../../apis/Axios";
import { toast } from "react-toastify";
import MainPageStyle from "../../styles/MainPage";
import Img from "../common/Img";

//components
import Post from "../common/Post";
import FloatingActionBar from "../layout/FloatingActionBar";
import ComposePostButton from "../common/ComposePostButton";

//mui
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import CircularProgress from "@mui/material/CircularProgress";
import FavoriteIcon from "@mui/icons-material/Favorite";
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

const FreeBoard = () => {
  const navigate = useNavigate();

  const isMobile = IsMobile();

  const [postCountOpen, setPostCountOpen] = useState<boolean>(false);
  const scrollTarget = useRef<HTMLDivElement>(null);
  const [toggle, setToggle] = useState<number>(0);
  const [searchComm, setSearchComm] = useState<string>("");

  const { search } = useLocation();
  useEffect(() => {
    const query = decodeURI(search.split("?search=")[1]);
    if (search) {
      setTimeout(() => {
        // setToggle(2);
        setSearchComm(query);
        window.scrollTo({
          top: scrollTarget.current?.scrollHeight,
          left: 0,
          behavior: "smooth"
        });
      }, 100);
      setTimeout(() => {
        searchCommPosts.refetch();
      }, 200);
    }
  }, [search]);
  useEffect(() => {
    const hash = decodeURI(window.location.hash);
    if (hash) {
      console.log(decodeURI(window.location.hash));
      setTimeout(() => {
        setToggle(2);
        setSearchComm(hash);
        window.scrollTo({
          top: scrollTarget.current?.scrollHeight,
          left: 0,
          behavior: "smooth"
        });
      }, 100);
      setTimeout(() => {
        searchCommPosts.refetch();
      }, 200);
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

  const freeHashtag = Hashtag.get({ type: 2, limit: 10 }).data;
  const user = User.get().data;
  const pillSub = user ? (["All", "Feed"] as const) : (["All"] as const);

  //this month
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

  //load posts
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
  //load search posts
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

  useEffect(() => {
    if (!user && toggle === 1) setToggle(0);
  }, [user, toggle]);

  const shortTag = (tag: string) => {
    if (tag?.length >= 11) return tag.slice(0, 10) + "...";
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
        <ComposePostButton postType={2} />
      </FloatingActionBar>
      <MainPageStyle.TextWrapper ref={scrollTarget}>
        <MainPageStyle.TextWrapper_Title>Free Board</MainPageStyle.TextWrapper_Title>
        <MainPageStyle.Space height={16}></MainPageStyle.Space>
        <MainPageStyle.TextWrapper_Normal>자유 주제로 이야기를 나누는 게시판입니다.</MainPageStyle.TextWrapper_Normal>
        <MainPageStyle.TextWrapper_Normal>서로에게 존중과 배려를 보여주세요 :)</MainPageStyle.TextWrapper_Normal>
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
              Free {monthNew} • Feed Posts {monthFeed ?? "-"}
            </MainPageStyle.TextWrapper_Normal>
          </>
        )}

        {topPosts?.length >= 1 && (
          <>
            {/* <MainPageStyle.Space height={8} /> */}
            <MainPageStyle.TextWrapper_SubBold>Popular Free Posts</MainPageStyle.TextWrapper_SubBold>
            <MainPageStyle.TopWrapper>
              {topPosts?.map(
                (
                  v: {
                    Comments: Array<{ id: number }>;
                    Images: Array<{ src: string }>;
                    content: string;
                    LikeCount: number;
                    id: number;
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
                        <FavoriteIcon id="icon2" fontSize="inherit" /> {makeK(v.LikeCount)}
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
      <MainPageStyle.Pill.Wrapper>
        {pillSub.map((v, i) => (
          <MainPageStyle.Pill.Sub
            key={v}
            toggle={toggle}
            onClick={() => {
              setToggle(i);
              navigate({
                pathname: "/main/2"
              });
              scrollTargerheight();
            }}
          >
            {v}
          </MainPageStyle.Pill.Sub>
        ))}

        <MainPageStyle.Pill.Search
          toggle={toggle === 2}
          onClick={() => {
            setToggle(2);
            // window.scrollTo({
            //   top: scrollTarget.current?.scrollHeight,
            //   left: 0,
            //   behavior: "smooth"
            // });
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchComm.length !== 0) {
                navigate({
                  pathname: "/main/2",
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
            //모든 소통글
            <>
              {communityPosts.data?.pages[0].length === 0 && (
                <MainPageStyle.EmptyNoti>
                  <SentimentVeryDissatisfiedIcon fontSize="inherit" />
                  <span>포스트가 존재하지 않습니다.</span>
                </MainPageStyle.EmptyNoti>
              )}
              <InfiniteScroll
                // scrollableTarget="scrollWrapper"
                hasMore={communityPosts.hasNextPage || false}
                loader={
                  <MainPageStyle.LoadingIconWrapper>
                    <CircularProgress size={96} color="inherit" />
                  </MainPageStyle.LoadingIconWrapper>
                }
                next={() => communityPosts.fetchNextPage()}
                dataLength={communityPosts.data?.pages.reduce((total, page) => total + page.length, 0) || 0}
              >
                {communityPosts?.data?.pages.map((p) =>
                  p.map((v: postProps, i: number) => <Post key={"post" + i} postProps={v} />)
                )}
              </InfiniteScroll>
            </>
          )}
          {toggle === 1 && (
            //피드 소통글
            <>
              {(feedPosts?.data?.pages?.[0]?.length ?? 0) === 0 && (
                <MainPageStyle.EmptyNoti>
                  <SentimentVeryDissatisfiedIcon fontSize="inherit" />
                  <span>포스트가 존재하지 않습니다.</span>
                </MainPageStyle.EmptyNoti>
              )}
              <InfiniteScroll
                // scrollableTarget="scrollWrapper"
                hasMore={feedPosts?.hasNextPage || false}
                loader={
                  <MainPageStyle.LoadingIconWrapper>
                    <CircularProgress size={96} color="inherit" />
                  </MainPageStyle.LoadingIconWrapper>
                }
                next={() => feedPosts?.fetchNextPage()}
                dataLength={feedPosts?.data?.pages.reduce((total, page) => total + page.length, 0) || 0}
              >
                {feedPosts?.data?.pages.map((p) =>
                  p.map((v: postProps, i: number) => <Post key={"post" + i} postProps={v} />)
                )}
              </InfiniteScroll>
            </>
          )}
          {toggle === 2 && (
            <>
              {searchCommPosts.data?.pages[0].length === 0 && (
                <MainPageStyle.EmptyNoti>
                  <SentimentVeryDissatisfiedIcon fontSize="inherit" />
                  <span>검색 결과가 존재하지 않습니다.</span>
                </MainPageStyle.EmptyNoti>
              )}
              <InfiniteScroll
                hasMore={searchCommPosts.hasNextPage || false}
                loader={
                  <MainPageStyle.LoadingIconWrapper>
                    <CircularProgress size={96} color="inherit" />
                  </MainPageStyle.LoadingIconWrapper>
                }
                next={() => searchCommPosts.fetchNextPage()}
                dataLength={searchCommPosts.data?.pages.reduce((total, page) => total + page.length, 0) || 0}
              >
                {searchCommPosts?.data?.pages.map((p) =>
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
            <span className="subTitle">Free Posts</span>
            {freeHashtag?.map((v: { id: number; name: string }) => (
              <span
                id="tagItem"
                key={v?.id}
                onClick={() => {
                  navigate(`/main/2/search/#${encodeURI(v?.name)}`);
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

export default FreeBoard;
