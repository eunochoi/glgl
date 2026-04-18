import React, { useEffect, useRef } from "react";
import styled from "styled-components/macro";
import Axios from "../apis/Axios";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

import useAlert from "../components/common/Alert";

//components
import AppLayout from "../components/AppLayout";
import FloatingActionBar from "../components/layout/FloatingActionBar";
import Post from "../components/common/Post";
import InfiniteScroll from "react-infinite-scroll-component";
import Img from "../components/common/Img";

//style
import Animation from "../styles/Animation";

//mui
import Badge from "@mui/material/Badge";
import InsertEmoticonRoundedIcon from "@mui/icons-material/InsertEmoticonRounded";
import InsertEmoticonOutlinedIcon from "@mui/icons-material/InsertEmoticonOutlined";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import User from "../functions/reactQuery/User";
import CircularProgress from "@mui/material/CircularProgress";
import IsMobile from "../functions/IsMobile";

interface userProps {
  email: string;
  id: number;
  nickname: string;
}
interface imageProps {
  src: string;
}
interface postProps {
  id: number;
  User: userProps;
  Images: imageProps[];
  content: string;
  createdAt: string;
}
interface user {
  usertext: string;
  nickname: string;
  id: number;
  profilePic: string;
}

const UserInfo = () => {
  const isMobile = IsMobile();
  const params = useParams();
  const categoryNum = params.cat ? parseInt(params.cat) : 0;
  const id = params.id ? parseInt(params.id) : 0;

  const navigate = useNavigate();
  const scrollTarget = useRef<HTMLDivElement>(null);
  const category = ["Tip Posts", "Free Posts", "Bookmark", "Like", "Followings", "Followers"];

  const { Alert: FollowConfirm, openAlert: openFollowConfirm } = useAlert();
  const { Alert: UnFollowConfirm, openAlert: openUnFollowConfirm } = useAlert();

  const user = User.get().data;
  const { data: targetUser, refetch } = useQuery(
    ["targetUser"],
    () => Axios.get("user/info", { params: { id } }).then((res) => res.data),
    {
      onSuccess: (res) => {
        if (res.level === 0) {
          history.back();
        }
        if (user && res.id === user.id) {
          console.log("내 페이지");
          navigate("/main/4/cat/0");
        }
      },
      onError: () => {
        // location.reload();
        navigate("/");
      }
    }
  );

  //function
  const scrollToPill = () => {
    window.scrollTo({
      top: scrollTarget.current?.scrollHeight,
      left: 0,
      behavior: "smooth"
    });
  };
  const isFollowed = user ? targetUser?.Followers?.find((v: any) => v.id === user.id) : undefined;

  //useMutation
  const follow = User.follow();
  const unFollow = User.unFollow();

  //bookmarked tips
  const bookmarkPosts = useInfiniteQuery(
    ["bookmarkPosts"],
    ({ pageParam = 1 }) =>
      Axios.get("post/user/liked", { params: { type: 1, id, pageParam, tempDataNum: 12 } }).then((res) => res.data),
    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === 0 ? undefined : allPages.length + 1;
      }
    }
  );
  const likePosts = useInfiniteQuery(
    ["likePosts"],
    ({ pageParam = 1 }) =>
      Axios.get("post/user/liked", { params: { type: 2, id, pageParam, tempDataNum: 12 } }).then((res) => res.data),
    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === 0 ? undefined : allPages.length + 1;
      }
    }
  );
  const infoPosts = useInfiniteQuery(
    ["userInfoPosts"],
    ({ pageParam = 1 }) =>
      Axios.get("post/user", { params: { id, type: 1, pageParam, tempDataNum: 12 } }).then((res) => res.data),
    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === 0 ? undefined : allPages.length + 1;
      }
    }
  );
  const commPosts = useInfiniteQuery(
    ["userCommPosts"],
    ({ pageParam = 1 }) =>
      Axios.get("post/user", { params: { id, type: 2, pageParam, tempDataNum: 12 } }).then((res) => res.data),
    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === 0 ? undefined : allPages.length + 1;
      }
    }
  );

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
    refetch();
    bookmarkPosts.refetch();
    infoPosts.refetch();
    commPosts.refetch();
  }, [id]);

  useEffect(() => {
    if (categoryNum >= 0 && categoryNum <= 5) {
      // console.log("올바른 링크 접근");
      const menuWrapper = document.getElementById("menuWrapper");
      const width = menuWrapper?.scrollWidth;
      if (width) {
        menuWrapper?.scrollTo({ top: 0, left: (width / 6) * categoryNum - 70, behavior: "smooth" });
      }

      const height = scrollTarget.current?.scrollHeight;
      console.log(height, window.scrollY);

      if (height && height < window?.scrollY) {
        scrollToPill();
      }
    } else {
      navigate("/404");
    }
  }, [categoryNum]);

  return (
    <AppLayout>
      <FloatingActionBar />
      <Wrapper>
        {createPortal(
          <>
            <FollowConfirm />
            <UnFollowConfirm />
          </>,
          document.getElementById("modal_root") as HTMLElement
        )}

        <UserInfoWrapper ref={scrollTarget}>
          {targetUser?.profilePic ? (
            <Pic crop={true} alt="userProfilePic" src={`${targetUser?.profilePic}`} />
          ) : (
            <Pic crop={true} alt="userProfilePic" src={`${process.env.PUBLIC_URL}/img/defaultProfilePic.png`} />
          )}

          <span id="nickname">{targetUser?.nickname?.slice(0, 8)}</span>
          <span id="email">{targetUser?.email}</span>
          <span id="usertext">{targetUser?.usertext ? targetUser?.usertext : "-"}</span>
          <span id="userstate">
            Posts {targetUser?.Posts?.length} • Followings {targetUser?.Followings?.length} • Followers{" "}
            {targetUser?.Followers?.length}
          </span>

          {user && user.level !== 0 && (
            <>
              {isFollowed ? (
                <FollowButton
                  onClick={() => {
                    openUnFollowConfirm({
                      mainText: "언팔로우 하시겠습니까?",
                      onSuccess: () => unFollow.mutate({ userId: targetUser?.id })
                    });
                  }}
                >
                  unfollow
                </FollowButton>
              ) : (
                <FollowButton
                  onClick={() => {
                    openFollowConfirm({
                      mainText: "팔로우 하시겠습니까?",
                      onSuccess: () => follow.mutate({ userId: targetUser?.id })
                    });
                  }}
                >
                  follow
                </FollowButton>
              )}
            </>
          )}
        </UserInfoWrapper>

        <MenuWrapper id="menuWrapper">
          {category.map((v, i) => (
            <Pill
              catNum={categoryNum}
              key={"catNum" + i}
              onClick={() => {
                // window.scrollTo({
                //   top: scrollTarget.current?.scrollHeight,
                //   left: 0,
                //   behavior: "smooth"
                // });

                setTimeout(() => {
                  navigate(`/userinfo/${targetUser?.id}/cat/${i}`);
                }, 1);
              }}
            >
              {v}
            </Pill>
          ))}
        </MenuWrapper>
        {categoryNum === 0 && (
          <ContentWrapper>
            <Posts>
              {infoPosts?.data?.pages[0].length === 0 && (
                <EmptyNoti>
                  <SentimentVeryDissatisfiedIcon fontSize="inherit" />
                  <span>포스트가 존재하지 않습니다.</span>
                </EmptyNoti>
              )}
              {infoPosts?.data?.pages[0].length !== 0 && (
                <InfiniteScroll
                  hasMore={infoPosts.hasNextPage || false}
                  loader={
                    <LoadingIconWrapper>
                      <CircularProgress size={96} color="inherit" />
                    </LoadingIconWrapper>
                  }
                  next={() => infoPosts.fetchNextPage()}
                  dataLength={infoPosts.data?.pages.reduce((total, page) => total + page.length, 0) || 0}
                >
                  {infoPosts?.data?.pages.map((p) => (
                    <Grid key={"grid" + p}>
                      {p.map((v: postProps, i: number) => {
                        if (v.Images.length >= 1) {
                          return (
                            <Img
                              onClick={() => navigate(`/postview/${v.id}`)}
                              id="imageItem"
                              key={"post" + i}
                              crop={true}
                              src={`${v.Images[0].src}`}
                              alt="img"
                            />
                          );
                        } else {
                          return (
                            <div onClick={() => navigate(`/postview/${v.id}`)} id="textItem" key={"post" + i}>
                              <span>{v.content}</span>
                            </div>
                          );
                        }
                      })}
                    </Grid>
                  ))}
                </InfiniteScroll>
              )}
            </Posts>
          </ContentWrapper>
        )}
        {categoryNum === 1 && (
          <ContentWrapper>
            <Posts>
              {commPosts?.data?.pages[0].length === 0 && (
                <EmptyNoti>
                  <SentimentVeryDissatisfiedIcon fontSize="inherit" />
                  <span>포스트가 존재하지 않습니다.</span>
                </EmptyNoti>
              )}
              {commPosts?.data?.pages[0].length !== 0 && (
                <InfiniteScroll
                  hasMore={commPosts.hasNextPage || false}
                  loader={
                    <LoadingIconWrapper>
                      <CircularProgress size={96} color="inherit" />
                    </LoadingIconWrapper>
                  }
                  next={() => commPosts.fetchNextPage()}
                  dataLength={commPosts.data?.pages.reduce((total, page) => total + page.length, 0) || 0}
                >
                  {commPosts?.data?.pages.map((p) => (
                    <Grid key={"grid" + p}>
                      {p.map((v: postProps, i: number) => {
                        if (v.Images.length >= 1) {
                          return (
                            <Img
                              onClick={() => navigate(`/postview/${v.id}`)}
                              id="imageItem"
                              key={"post" + i}
                              crop={true}
                              src={`${v.Images[0].src}`}
                              alt="img"
                            />
                          );
                        } else {
                          return (
                            <div onClick={() => navigate(`/postview/${v.id}`)} id="textItem" key={"post" + i}>
                              <span>{v.content}</span>
                            </div>
                          );
                        }
                      })}
                    </Grid>
                  ))}
                </InfiniteScroll>
              )}
            </Posts>
          </ContentWrapper>
        )}
        {categoryNum === 2 && (
          <ContentWrapper>
            <Posts>
              {bookmarkPosts?.data?.pages[0].length === 0 && (
                <EmptyNoti>
                  <SentimentVeryDissatisfiedIcon fontSize="inherit" />
                  <span>포스트가 존재하지 않습니다.</span>
                </EmptyNoti>
              )}
              {bookmarkPosts?.data?.pages[0].length !== 0 && (
                <InfiniteScroll
                  hasMore={bookmarkPosts.hasNextPage || false}
                  loader={
                    <LoadingIconWrapper>
                      <CircularProgress size={96} color="inherit" />
                    </LoadingIconWrapper>
                  }
                  next={() => bookmarkPosts.fetchNextPage()}
                  dataLength={bookmarkPosts.data?.pages.reduce((total, page) => total + page.length, 0) || 0}
                >
                  {bookmarkPosts?.data?.pages.map((p) => (
                    <Grid key={"grid" + p}>
                      {p.map((v: postProps, i: number) => {
                        if (v.Images.length >= 1) {
                          return (
                            <Img
                              onClick={() => navigate(`/postview/${v.id}`)}
                              id="imageItem"
                              key={"post" + i}
                              crop={true}
                              src={`${v.Images[0].src}`}
                              alt="img"
                            />
                          );
                        } else {
                          return (
                            <div onClick={() => navigate(`/postview/${v.id}`)} id="textItem" key={"post" + i}>
                              <span>{v.content}</span>
                            </div>
                          );
                        }
                      })}
                    </Grid>
                  ))}
                </InfiniteScroll>
              )}
            </Posts>
          </ContentWrapper>
        )}
        {categoryNum === 3 && (
          <ContentWrapper>
            <Posts>
              {likePosts?.data?.pages[0].length === 0 && (
                <EmptyNoti>
                  <SentimentVeryDissatisfiedIcon fontSize="inherit" />
                  <span>포스트가 존재하지 않습니다.</span>
                </EmptyNoti>
              )}
              {likePosts?.data?.pages[0].length !== 0 && (
                <InfiniteScroll
                  hasMore={likePosts.hasNextPage || false}
                  loader={
                    <LoadingIconWrapper>
                      <CircularProgress size={96} color="inherit" />
                    </LoadingIconWrapper>
                  }
                  next={() => likePosts.fetchNextPage()}
                  dataLength={likePosts.data?.pages.reduce((total, page) => total + page.length, 0) || 0}
                >
                  {likePosts?.data?.pages.map((p) => (
                    <Grid key={"grid" + p}>
                      {p.map((v: postProps, i: number) => {
                        if (v.Images.length >= 1) {
                          return (
                            <Img
                              onClick={() => navigate(`/postview/${v.id}`)}
                              id="imageItem"
                              key={"post" + i}
                              crop={true}
                              src={`${v.Images[0].src}`}
                              alt="img"
                            />
                          );
                        } else {
                          return (
                            <div onClick={() => navigate(`/postview/${v.id}`)} id="textItem" key={"post" + i}>
                              <span>{v.content}</span>
                            </div>
                          );
                        }
                      })}
                    </Grid>
                  ))}
                </InfiniteScroll>
              )}
            </Posts>
          </ContentWrapper>
        )}
        {categoryNum === 4 && (
          <ContentWrapper>
            <ContentBox>
              <ListTitle>
                <Badge badgeContent={targetUser?.Followings?.length} color="info" max={999} showZero>
                  <InsertEmoticonRoundedIcon fontSize="large" color="inherit" />
                </Badge>
                <div>Followings</div>
              </ListTitle>
              <List>
                {targetUser?.Followings?.length === 0 ? (
                  <EmptyUserNoti>
                    <span>팔로잉 목록이 존재하지 않습니다.</span>
                  </EmptyUserNoti>
                ) : (
                  targetUser?.Followings?.map((v: user, i: number) => (
                    <ListItem key={v.nickname + i}>
                      <div onClick={() => navigate(`/userinfo/${v?.id}/cat/0`)}>
                        {v.profilePic ? (
                          <ProfilePic32 crop={true} alt="ProfilePic" src={v.profilePic} />
                        ) : (
                          <ProfilePic32
                            crop={true}
                            alt="defaultProfilePic"
                            src={`${process.env.PUBLIC_URL}/img/defaultProfilePic.png`}
                          />
                        )}
                        <span>{v.nickname?.slice(0, 8)}</span>
                      </div>
                      {isMobile || <span id="usertext">{v.usertext}</span>}
                    </ListItem>
                  ))
                )}
              </List>
            </ContentBox>
          </ContentWrapper>
        )}
        {categoryNum === 5 && (
          <ContentWrapper>
            <ContentBox>
              <ListTitle>
                <Badge badgeContent={targetUser?.Followers?.length} color="info" max={999} showZero>
                  <InsertEmoticonOutlinedIcon fontSize="large" />
                </Badge>
                <div>Followers</div>
              </ListTitle>
              <List>
                {targetUser?.Followers?.length === 0 ? (
                  <EmptyUserNoti>
                    <span>팔로워 목록이 존재하지 않습니다.</span>
                  </EmptyUserNoti>
                ) : (
                  targetUser?.Followers?.map((v: user, i: number) => (
                    <ListItem key={v.nickname + i}>
                      <div onClick={() => navigate(`/userinfo/${v?.id}/cat/0`)}>
                        {v.profilePic ? (
                          <ProfilePic32 crop={true} alt="ProfilePic" src={`${v.profilePic}`} />
                        ) : (
                          <ProfilePic32
                            crop={true}
                            alt="ProfilePic"
                            src={`${process.env.PUBLIC_URL}/img/defaultProfilePic.png`}
                          />
                        )}
                        <span>{v.nickname?.slice(0, 8)}</span>
                      </div>
                      {isMobile || <span id="usertext">{v.usertext}</span>}
                    </ListItem>
                  ))
                )}
              </List>
            </ContentBox>
          </ContentWrapper>
        )}
      </Wrapper>
    </AppLayout>
  );
};

export default UserInfo;
const Grid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: stretch;

  row-gap: 8px;
  column-gap: 8px;
  margin-bottom: 8px;

  #imageItem {
    width: 100%;
    aspect-ratio: 1 / 1;

    border: 2px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }
  #textItem {
    background-color: #fafafa;
    width: 100;
    aspect-ratio: 1 / 1;

    border: 2px solid rgba(0, 0, 0, 0.05);
    border-radius: 8px;

    display: flex;
    justify-content: center;
    align-items: center;

    overflow: hidden;
    > span {
      width: 80% !important;
      overflow: hidden !important;
      height: auto;

      line-height: 1.3em;
      font-size: 18px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.65);

      white-space: pre-wrap;
      overflow-wrap: break-word;
      text-overflow: ellipsis;

      display: -webkit-box;
      -webkit-line-clamp: 5 !important;
      -webkit-box-orient: vertical;
    }
  }
  @media (orientation: portrait) {
    grid-template-columns: 1fr 1fr;
    /* row-gap: 4px;
    column-gap: 4px; */
    margin-bottom: 4px;
    #textItem > span {
      font-size: 16px;
      -webkit-line-clamp: 4 !important; /* 원하는 줄 수 표시 */
    }
  }
`;
const Wrapper = styled.div`
  animation: ${Animation.smoothAppear} 0.5s ease-in-out;
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const LoadingIconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: #f3e0f1;
  margin: 32px 0;
`;

const Pic = styled(Img)`
  /* position: absolute;
  right: 0px; */
  background-color: white;
  width: 190px;
  height: 190px;
  border-radius: 12px;
  /* box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.2); */
  border: 3px solid rgba(0, 0, 0, 0.1);

  /* @media (orientation: portrait) or (max-height: 480px) {
    width: 200px;
    height: 200px;
  } */
`;

const ListTitle = styled.div`
  font-size: 60px;
  color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  > div {
    margin-top: 5px;
    font-size: 20px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.7);
  }
  @media (orientation: portrait) or (max-height: 480px) {
    font-size: 40px;
    > div {
      font-size: 18px;
    }
  }
`;

const Pill = styled.button<{ catNum: number }>`
  height: 32px;
  margin-right: 12px;
  padding: 6px 20px;
  border-radius: 100px;

  font-weight: 500;
  font-size: 18px;

  display: flex;
  align-items: center;
  cursor: pointer;

  /* box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.3); */
  border: solid 2px rgba(0, 0, 0, 0.05);

  color: #464b53;
  background-color: #e3ecf9;
  &:nth-child(${(props) => props.catNum + 1}) {
    background-color: #f3e0f1;
  }

  @media (orientation: portrait) or (max-height: 480px) {
    margin-right: 8px;
    &:last-child {
      margin-right: 0;
    }
  }
`;

const UserInfoWrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: start;

  width: 500px;
  width: 70%;
  height: 500px;

  #nickname {
    /* text-transform: uppercase; */

    font-size: 40px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.7);
    margin: 12px 0;
  }
  #email {
    font-size: 16px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.4);
    margin: 4px 0;
  }
  #usertext {
    font-size: 18px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.6);
    margin-top: 4px;
    margin-bottom: 24px;
  }
  #userstate {
    font-size: 18px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.65);
    margin-bottom: 48px;
  }
  @media (orientation: portrait) or (max-height: 480px) {
    width: 92vw;
    margin-top: 36px;
    #userstate {
      font-size: 16px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.65);
      margin-bottom: 40px;
    }
  }
  @media (orientation: landscape) and (max-height: 480px) {
    width: 400px;
    width: 80%;
    height: auto;
    padding-left: 0;
    margin-top: 0;
    padding-top: 12px;
    padding-bottom: 12px;
  }
`;
const FollowButton = styled.button`
  cursor: pointer;
  text-transform: uppercase;

  font-size: 14px;
  font-weight: 600;
  height: 36px;
  width: 96px;
  border: 3px rgba(0, 0, 0, 0.6) solid;
  border-radius: 6px;

  margin-bottom: 12px;

  color: rgba(0, 0, 0, 0.6);

  transition: all ease-in-out 0.3s;
  &:hover {
    transform: scale(1.05);
  }
  @media (orientation: portrait) or (max-height: 480px) {
    /* margin-bottom: 48px; */
  }
`;

const MenuWrapper = styled.div`
  position: sticky;
  top: 0px;
  z-index: 85;
  /* background: rgb(255, 255, 255);
  background: linear-gradient(0deg, rgba(255, 255, 255, 0) 0%, rgba(245, 245, 245, 1) 11%, rgba(245, 245, 245, 1) 100%); */
  background-color: #fff;

  display: flex;
  justify-content: start;
  align-items: center;
  height: auto;
  width: 500px;
  width: 70%;

  padding: 24px 0;
  margin-bottom: 12px;

  overflow-x: scroll;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera*/
  }
  @media (orientation: portrait) or (max-height: 480px) {
    padding: 12px 0;
    top: 48px;
    top: 46px;
    width: 100%;
    padding-left: 4vw;
    padding-right: 4vw;
  }
  @media (orientation: landscape) and (max-height: 480px) {
    width: 400px;
    width: 80%;
    padding-left: 4px;
    top: 0;
  }
`;
const ContentWrapper = styled.div`
  animation: ${Animation.smoothAppear} 1s ease-in-out;

  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;

  width: 100%;
  height: auto;
  //pill wrapper : 68px
  min-height: calc(100vh - 80px);

  padding-bottom: 24px;
  @media (orientation: portrait) or (max-height: 480px) {
    //haeder height : 48px
    //pill wrapper : 68px
    min-height: calc(100vh - 48px - 80px);
  }
  @media (orientation: landscape) and (max-height: 480px) {
    width: 400px;
    width: 100%;
    min-height: calc(100vh - 80px);
  }
`;
const ContentBox = styled.div`
  border-radius: 6px;
  transition: all ease-in-out 0.3s;
  width: 500px;
  width: 70%;
  min-height: calc(100vh - 104px - 24px);

  padding: 40px 20px;
  /* margin-bottom: 24px; */

  /* box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2); */
  background-color: rgba(0, 0, 0, 0.02);
  background-color: #fafafa;
  border: 2px rgba(0, 0, 0, 0.07) solid;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  * {
    flex-shrink: 0;
  }
  button {
    color: #aaa7d4;
  }
  @media (orientation: portrait) or (max-height: 480px) {
    width: 92vw;
    min-height: calc(100vh);
    min-height: calc(var(--vh, 1vh) * 100 - 48px - 104px - 24px);
    /* background-color: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(4px); */
  }
  @media (orientation: landscape) and (max-height: 480px) {
    /* width: 400px; */
    width: 80%;
    /* min-height: 80%; */
  }
`;

const EmptyNoti = styled.div`
  width: 100%;
  height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  font-size: 72px;
  color: rgba(0, 0, 0, 0.5);

  /* font-weight: 600; */
  span {
    margin-top: 20px;
    font-size: 24px;
  }
`;
const EmptyUserNoti = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  white-space: nowrap;

  color: rgba(0, 0, 0, 0.5);

  span {
    font-weight: 500;
    margin-top: 20px;
    font-size: 18px;
  }
`;

const List = styled.div`
  padding: 20px 0;
  width: 80%;
  height: 50%;

  flex-grow: 1;
  -webkit-box-flex: 1;

  overflow-y: scroll;
`;
const ListItem = styled.div`
  width: 100%;
  padding: 5px 5px;
  font-size: 18px;
  color: rgba(0, 0, 0, 0.5);

  display: flex;
  justify-content: space-between;
  align-items: center;
  #usertext {
    max-width: 40%;
    white-space: nowrap;
    overflow-x: scroll;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  > div {
    display: flex;
    justify-content: center;
    align-items: center;
    > span {
      margin-left: 10px;
      font-weight: 500;
    }
  }
  > span {
    font-weight: 500;
  }
  > button {
    min-width: 0;
  }
  @media (orientation: portrait) or (max-height: 480px) {
    > div {
      width: 100%;
      justify-content: space-between;
    }
  }
`;

const ProfilePic32 = styled(Img)`
  width: 32px;
  height: 32px;
  border-radius: 100%;

  background-color: #fff;

  border: 2px solid rgba(0, 0, 0, 0.1);
`;

const Posts = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;

  .infinite-scroll-component__outerdiv {
    width: 100%;
  }

  padding-top: 4px;

  width: 100%;
  width: 70%;
  overflow: hidden;
  height: auto;
  * {
    flex-shrink: 0;
  }
  > div {
    animation: ${Animation.smoothAppear} 0.7s;
  }
  @media (orientation: portrait) or (max-height: 480px) {
    width: 92vw;
  }
  @media (orientation: landscape) and (max-height: 480px) {
    width: 80%;
  }
`;
