import React, { useEffect, useState } from "react";
import styled from "styled-components/macro";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import CustomCarousel from "./common/CustomCarousel";
import Img from "./common/Img";
import { toast } from "react-toastify";
import Clipboard from "react-clipboard.js";

//mui
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import CloseIcon from "@mui/icons-material/Close";
import IsMobile from "../functions/IsMobile";
import Post from "../functions/reactQuery/Post";
import User from "../functions/reactQuery/User";
import LinkIcon from "@mui/icons-material/Link";
import { useModalStack } from "../store/modalStack";
import { useBrowserCheck } from "../store/borowserCheck";
import { postTypeToSearchBasePath } from "../routes/boardPaths";

interface Image {
  src: string;
}
interface props {
  postProps: any;
  setZoom: (b: boolean) => void;
}

const PostZoom = ({ postProps, setZoom }: props) => {
  const { push, pop, modalStack } = useModalStack();
  const { browser } = useBrowserCheck();

  const [animation, setAnimation] = useState<"open" | "close" | "">("");

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const user = User.get().data;
  const postHaveDate = postProps?.start && postProps?.end;
  const postHaveLink = postProps?.link && true;
  const [crop, setCrop] = useState<boolean>(false);

  //useMutation
  const like = Post.like();
  const disLike = Post.disLike();

  //local
  const isMobile = IsMobile();
  const makeCorectUrl = (url: string) => {
    url = url.toLowerCase();
    return "https://" + url.replace("https:/", "").replace("http:/", "");
  };

  const isOnlyText = postProps.Images.length === 0;
  const isLiked = postProps?.Likers?.find((v: any) => v.id === user?.id);

  const navigate = useNavigate();
  // const [timer, setTimer] = useState<NodeJS.Timeout>();

  const ButtonClose = () => {
    setAnimation("close");
    // setTimer(
    //   setTimeout(() => {
    //     history.back();
    //   }, 300)
    // );
  };

  useEffect(() => {
    if (modalStack[modalStack.length - 1] === "#zoom") {
      window.onpopstate = () => {
        console.log("pop: post zoom");

        // setAnimation("close");

        if (browser === "Safari") setZoom(false);
        else setAnimation("close");
      };
    }
  }, [modalStack.length]);

  useEffect(() => {
    setAnimation("open");
    push("#zoom");
    // clearTimeout(timer);
    return () => {
      window.onpopstate = null;
      pop();
    };
  }, []);

  return (
    <PostZoomBG
      animation={animation}
      onTransitionEnd={() => {
        if (animation === "close") {
          setZoom(false);
        }
      }}
      onClick={() => {
        ButtonClose();
      }}
    >
      {
        //dasktop + only text
        !isMobile && isOnlyText && (
          <PCTextPost onClick={(e) => e.stopPropagation()}>
            <PCTextPost_Left>
              <Link to={`/userinfo/${postProps?.User?.id}/cat/0`}>
                {postProps?.User?.profilePic ? (
                  <ProfileCircle200 crop={true} alt="profilePic" src={`${postProps?.User?.profilePic}`} />
                ) : (
                  <ProfileCircle200
                    crop={true}
                    alt="profilePic"
                    src={`${process.env.PUBLIC_URL}/img/defaultProfilePic.png`}
                  />
                )}
              </Link>
              <div>
                <span id="nickname">{postProps.User.nickname?.slice(0, 8)}</span>
                <span id="email">{postProps.User.email}</span>
              </div>
              <span id="time">{moment(postProps?.createdAt).fromNow()}</span>
            </PCTextPost_Left>
            <PCTextPost_Right>
              <PCText>
                {postProps?.content?.split(/(#[^\s#]{1,15})/g).map((v: string, i: number) => {
                  if (v.match(/(#[^\s#]{1,15})/)) {
                    return (
                      <Hashtag
                        onClick={() => {
                          setAnimation("close");
                          navigate(`${postTypeToSearchBasePath(postProps.type)}/${encodeURI(v)}`);
                        }}
                        key={i}
                      >
                        {v}
                      </Hashtag>
                    );
                  }
                  return v;
                })}
              </PCText>
              {(postHaveDate || postHaveLink) && (
                <SubContent>
                  {postHaveDate && (
                    <PostStartEnd>
                      <span>
                        <CalendarMonthIcon />
                      </span>
                      <span>{moment(postProps?.start).format("YY.MM.DD")}</span>
                      <span>~</span>
                      <span>{moment(postProps?.end).format("YY.MM.DD")}</span>
                    </PostStartEnd>
                  )}

                  {postHaveLink && (
                    <PostLink>
                      <InsertLinkIcon />
                      <span>
                        <a target="_blank" href={makeCorectUrl(postProps?.link)} rel="noreferrer">
                          {makeCorectUrl(postProps?.link)}
                        </a>
                      </span>
                    </PostLink>
                  )}
                </SubContent>
              )}

              <Like>
                <button
                  onClick={() => {
                    if (!isLiked) {
                      like.mutate(postProps.id);
                    } else {
                      disLike.mutate(postProps.id);
                    }
                  }}
                >
                  {postProps.type === 1 &&
                    (isLiked ? <BookmarkIcon style={{ color: "#a9aed4" }} /> : <BookmarkBorderIcon />)}
                  {postProps.type === 1 ||
                    (isLiked ? <FavoriteIcon style={{ color: "#D5A8D0" }} /> : <FavoriteBorderIcon />)}
                  <span>{postProps?.Likers?.length}</span>
                </button>
              </Like>
            </PCTextPost_Right>
            <PCCancelBtn
              onClick={() => {
                ButtonClose();
              }}
            >
              <CloseIcon fontSize="medium" />
            </PCCancelBtn>
          </PCTextPost>
        )
      }
      {
        //desktop + image + text
        !isMobile && !isOnlyText && (
          <PCImagePost onClick={(e) => e.stopPropagation()}>
            <PCImagePost_LeftWrapper>
              <CustomCarousel indicator={postProps.Images.length === 1 ? false : true}>
                {postProps.Images?.map((v: Image, i: number) => (
                  <ImageBox key={i + v.src} onClick={() => setCrop((c) => !c)}>
                    <PostImage crop={crop} src={v?.src} alt="zoom image" />
                  </ImageBox>
                ))}
              </CustomCarousel>
            </PCImagePost_LeftWrapper>
            <PCImagePost_RightWrapper>
              <PCImagePost_Info>
                <div>
                  <Link to={`/userinfo/${postProps?.User?.id}/cat/0`}>
                    {postProps?.User?.profilePic ? (
                      <ProfileCircle40 crop={true} src={`${postProps?.User?.profilePic}`} alt="profilePic" />
                    ) : (
                      <ProfileCircle40
                        crop={true}
                        src={`${process.env.PUBLIC_URL}/img/defaultProfilePic.png`}
                        alt="profilePic"
                      />
                    )}
                  </Link>
                  <span>{postProps.User.nickname?.slice(0, 8)}</span>
                </div>
                <span>{moment(postProps?.createdAt).fromNow()}</span>
              </PCImagePost_Info>
              <PCText>
                {postProps?.content?.split(/(#[^\s#]{1,15})/g).map((v: string, i: number) => {
                  if (v.match(/(#[^\s#]{1,15})/)) {
                    return (
                      <Hashtag
                        onClick={() => {
                          setAnimation("close");
                          navigate(`${postTypeToSearchBasePath(postProps.type)}/${encodeURI(v)}`);
                        }}
                        key={i}
                      >
                        {v}
                      </Hashtag>
                    );
                  }
                  return v;
                })}
              </PCText>

              {(postHaveDate || postHaveLink) && (
                <SubContent>
                  {postHaveDate && (
                    <PostStartEnd>
                      <span>
                        <CalendarMonthIcon />
                      </span>
                      <span>{moment(postProps?.start).format("YY.MM.DD")}</span>
                      <span>~</span>
                      <span>{moment(postProps?.end).format("YY.MM.DD")}</span>
                    </PostStartEnd>
                  )}
                  {postHaveLink && (
                    <PostLink>
                      <InsertLinkIcon />
                      <span>
                        <a target="_blank" href={makeCorectUrl(postProps?.link)} rel="noreferrer">
                          {makeCorectUrl(postProps?.link)}
                        </a>
                      </span>
                    </PostLink>
                  )}
                </SubContent>
              )}

              <Like>
                <button
                  onClick={() => {
                    if (!isLiked) {
                      like.mutate(postProps.id);
                    } else {
                      disLike.mutate(postProps.id);
                    }
                  }}
                >
                  {postProps.type === 1 && (isLiked ? <BookmarkIcon id="bookmark" /> : <BookmarkBorderIcon />)}
                  {postProps.type === 1 || (isLiked ? <FavoriteIcon id="like" /> : <FavoriteBorderIcon />)}
                  <span>{postProps?.Likers?.length}</span>
                </button>
              </Like>
            </PCImagePost_RightWrapper>
            <PCCancelBtn
              onClick={() => {
                ButtonClose();
              }}
            >
              <CloseIcon fontSize="medium" />
            </PCCancelBtn>
          </PCImagePost>
        )
      }
      {
        //mobile
        isMobile && (
          <MobileWrapper
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <MobilePost>
              <MobilePostInfo>
                <div>
                  <Link to={`/userinfo/${postProps?.User?.id}/cat/0`}>
                    {postProps?.User?.profilePic ? (
                      <ProfileCircle40 crop={true} src={`${postProps?.User?.profilePic}`} alt="profilePic" />
                    ) : (
                      <ProfileCircle40
                        crop={true}
                        alt="profilePic"
                        src={`${process.env.PUBLIC_URL}/img/defaultProfilePic.png`}
                      />
                    )}
                  </Link>
                  <Nickname>{postProps.User.nickname?.slice(0, 8)}</Nickname>
                </div>
                <span>{moment(postProps?.createdAt).fromNow()}</span>
              </MobilePostInfo>

              <CustomCarousel indicator={postProps.Images.length === 0 ? false : true}>
                {postProps.Images?.map((v: Image, i: number) => (
                  <div key={i + v.src} onClick={() => setCrop((c) => !c)}>
                    <PostImage crop={crop} src={v?.src} alt="zoom image" />
                  </div>
                ))}
                <MobileText key="text">
                  <div id="content">
                    {postProps?.content?.split(/(#[^\s#]{1,15})/g).map((v: string, i: number) => {
                      if (v.match(/(#[^\s#]{1,15})/)) {
                        return (
                          <Hashtag
                            onClick={() => {
                              setAnimation("close");
                              navigate(`${postTypeToSearchBasePath(postProps.type)}/${encodeURI(v)}`);
                            }}
                            key={i}
                          >
                            {v}
                          </Hashtag>
                        );
                      }
                      return v;
                    })}
                  </div>
                  {(postHaveDate || postHaveLink) && (
                    <SubContent>
                      {postHaveDate && (
                        <PostStartEnd>
                          <span>
                            <CalendarMonthIcon />
                          </span>
                          <span>{moment(postProps?.start).format("YY.MM.DD")}</span>
                          <span>~</span>
                          <span>{moment(postProps?.end).format("YY.MM.DD")}</span>
                        </PostStartEnd>
                      )}
                      {postHaveLink && (
                        <PostLink>
                          <InsertLinkIcon />
                          <span>
                            <a target="_blank" href={makeCorectUrl(postProps?.link)} rel="noreferrer">
                              {makeCorectUrl(postProps?.link)}
                            </a>
                          </span>
                        </PostLink>
                      )}
                    </SubContent>
                  )}
                </MobileText>
              </CustomCarousel>
              <MobilePostMenu>
                <button
                  id="close"
                  onClick={() => {
                    ButtonClose();
                  }}
                >
                  <CloseIcon />
                  <span>Close</span>
                </button>
                <button
                  id="likeBtn"
                  onClick={() => {
                    if (!isLiked) {
                      like.mutate(postProps.id);
                    } else {
                      disLike.mutate(postProps.id);
                    }
                  }}
                >
                  {postProps.type === 1 && (isLiked ? <BookmarkIcon color="inherit" /> : <BookmarkBorderIcon />)}
                  {postProps.type === 1 || (isLiked ? <FavoriteIcon color="inherit" /> : <FavoriteBorderIcon />)}
                  <span>{postProps?.Likers?.length}</span>
                </button>
                <Clipboard
                  onSuccess={() => toast.success("공유 URL이 클립보드에 복사되었습니다.")}
                  component="a"
                  data-clipboard-text={`${BASE_URL}/postview/${postProps.id}`}
                >
                  <button id="coryUrlBtn" data-clipboard-text={`${BASE_URL}/postview/${postProps.id}`}>
                    <LinkIcon />
                    <span>URL</span>
                  </button>
                </Clipboard>
              </MobilePostMenu>
            </MobilePost>
          </MobileWrapper>
        )
      }
    </PostZoomBG>
  );
};

export default PostZoom;

const Hashtag = styled.span`
  cursor: pointer;
  color: #5e89c7;
  /* font-weight: 500; */
`;

const ImageBox = styled.div`
  img {
    object-position: 50% 50%;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
  }
`;

const ProfileCircle200 = styled(Img)`
  width: 200px;
  height: 200px;
  border-radius: 100%;
  background-color: white;

  border: 2px solid rgba(0, 0, 0, 0.1);
  object-fit: cover;
`;
const ProfileCircle40 = styled(Img)`
  width: 40px;
  height: 40px;
  border-radius: 100%;
  background-color: white;

  border: 2px solid rgba(0, 0, 0, 0.1);
  object-fit: cover;
`;
const MobilePostMenu = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;

  height: 40px;
  padding: 0 12px;

  background-color: #c8daf3;
  background-color: whitesmoke;

  border-top: 2px solid rgba(0, 0, 0, 0.1);
  #close {
    display: flex;
    justify-content: center;
    align-items: center;
    color: rgba(0, 0, 0, 0.7);
    span {
      font-size: 18px;
      font-weight: 500;
    }
  }
  #likeBtn {
    display: flex;
    justify-content: center;
    align-items: center;
    color: rgba(0, 0, 0, 0.7);
    span {
      margin-left: 8px;
      font-size: 18px;
      font-weight: 500;
    }
  }
  #coryUrlBtn {
    display: flex;
    justify-content: center;
    align-items: center;
    color: rgba(0, 0, 0, 0.7);
    span {
      margin-left: 8px;
      font-size: 18px;
      font-weight: 500;
    }
  }

  @media (orientation: landscape) and (max-height: 480px) {
    flex-direction: column-reverse;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0);
    border: none;

    position: fixed;
    left: 0;
    top: 76px;
    width: 200px;
    height: calc(var(--vh, 1vh) * 100 - 76px);
    padding: 20px 0;

    background-color: whitesmoke;
    border-right: 2px solid rgba(0, 0, 0, 0.05);
    > * {
      margin: 20px;
    }
    > *:nth-child(2) {
      order: 2;
    }
    span {
      font-size: 14px !important;
    }
  }
`;

const Nickname = styled.span`
  font-weight: 500;
  font-weight: 600;

  /* max-width: 50%; */
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  padding: 8px;
  font-size: 1.2em !important;

  @media (orientation: landscape) and (max-height: 480px) {
    width: auto;
  }
`;

//share range, link component
const SubContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;

  width: 100%;

  margin-top: 12px;

  font-size: 18px;
  @media (orientation: portrait) or (max-height: 480px) {
    width: 100%;
    margin-top: 0px;
    padding: 8px 24px;
  }

  > div {
    display: flex;
    justify-content: start;
    align-items: center;
  }

  @media (orientation: landscape) and (max-height: 480px) {
    padding: 0 64px;
    padding-top: 12px;
    /* padding-bottom: 24px; */
  }
`;
const PostStartEnd = styled.div`
  span {
    margin-right: 4px;
  }
  span:first-child {
    color: #be303e;
  }
`;
const PostLink = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  width: 100%;
  span {
    display: flex;
    justify-content: start;
    align-items: center;
    width: 100%;
    white-space: nowrap;
    overflow: scroll;
    color: #5974af;
    text-decoration-line: underline;
    margin-left: 4px;
  }
`;
const Like = styled.div`
  height: 50px;
  /* width: 100%; */
  display: flex;
  justify-content: center;
  align-items: center;
  #bookmark {
    color: #a9aed4;
  }
  #like {
    color: #d5a8d0;
  }
  span {
    font-size: 1.5em;
    margin-left: 4px;
  }
  button {
    display: flex;
    align-items: center;
  }
  @media (orientation: portrait) or (max-height: 480px) {
    align-items: center;
    height: 60px;
  }
`;

//image
const PostImage = styled(Img)`
  width: 100%;
  height: 90vh;

  /* display: flex;
  justify-content: center;
  align-items: center; */

  @media (orientation: portrait) or (max-height: 480px) {
    //top height 64px
    //bottom height 60px + 40px
    //indicator height 30px
    height: calc(100vh - 64px - 60px - 40px - 30px);
    height: calc(var(--vh, 1vh) * 100 - 64px - 40px - 30px);
    margin-bottom: 30px;
    flex-grow: 1;
  }
  @media (orientation: landscape) and (max-height: 480px) {
    height: calc(var(--vh, 1vh) * 100 - 30px);
  }
`;

//pc post zoom
const PostZoomBG = styled.div<{ animation: string }>`
  opacity: 0;
  opacity: ${(props) => (props.animation === "open" ? 1 : 0)};
  transition: linear 0.3s all;

  overflow: hidden;

  z-index: 4002;
  position: fixed;
  left: 0;
  top: 0;

  width: 100vw;
  height: 100vh;

  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);

  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;

  padding-top: 5vh;

  > button {
    padding-top: 16px;
  }
  @media (orientation: portrait) or (max-height: 480px) {
    justify-content: start;
    /* height: calc(var(--vh, 1vh) * 100); */
    padding-top: 0;
  }
`;
const PCTextPost = styled.div`
  position: relative;
  width: 70vw;
  height: 90vh;

  border-radius: 8px;

  display: flex;
  justify-content: center;
  align-items: center;

  background-color: #fff;
  box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.5);
  box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.2);
`;
const PCTextPost_Left = styled.div`
  width: 40%;
  height: 100%;
  padding: 72px 20px;

  background-color: rgba(0, 0, 0, 0.04);

  display: flex;
  flex-direction: column;
  justify-content: space-around;

  #nickname,
  #email,
  #time {
    text-align: center !important;
    max-width: 100%;
    overflow-x: scroll;
    white-space: nowrap;
    /* text-overflow: ellipsis; */

    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
    &::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera*/
    }
  }
  #nickname {
    font-weight: 500;
    color: rgba(0, 0, 0, 0.7);
    font-size: 36px;
    line-height: 48px;
  }
  #email {
    margin-top: 8px;
    padding: 5px;
    font-size: 18px;
    color: rgba(0, 0, 0, 0.4);
  }
  #time {
    width: 100%;
    text-align: center;
    font-size: 1.1em;
  }

  align-items: center;
  > div:nth-child(2) {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
`;
const PCTextPost_Right = styled.div`
  width: 60%;
  height: 100%;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const PCImagePost = styled.div`
  position: relative;
  width: 90vw;
  height: 90vh;
  border-radius: 8px;

  display: flex;
  justify-content: center;
  align-items: center;

  background-color: #fff;
  box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.5);
  box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.2);
`;
const PCImagePost_LeftWrapper = styled.div`
  width: 65%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.04);
`;
const PCImagePost_RightWrapper = styled.div`
  width: 35%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

  padding: 24px;
`;
const PCImagePost_Info = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  div {
    width: 70%;
    display: flex;
    justify-content: start;
    align-items: center;
    span {
      font-size: 1.1em;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 600;
      margin-left: 8px;
      color: rgba(0, 0, 0, 0.9);
    }
  }
  span {
    white-space: nowrap;
    padding: 8px 0;
    font-size: 1em;
    color: rgba(0, 0, 0, 0.5);
  }
`;
const PCText = styled.div`
  width: 100%;
  height: 50%;
  flex-grow: 1;

  padding: 16px 0;

  font-size: 20px;
  font-size: 18px;
  overflow-y: scroll;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.3em;

  /* color: rgba(0, 0, 0, 0.8); */
`;
const PCCancelBtn = styled.button`
  position: absolute;
  left: 10px;
  top: 10px;
  padding: 4px;

  z-index: 1005;

  display: flex;
  justify-content: center;
  align-items: center;

  color: white;
  background-color: black;
  border-radius: 100%;

  @media (orientation: portrait) or (max-height: 480px) {
    top: calc(100% - 50px);
    /* left: 10%; */
    /* transform: translateX(-50%); */
  }
`;

//mobile post zoom
const MobileWrapper = styled.div`
  transition: all ease-in-out 0.5s;
  position: relative;

  bottom: 0;
  left: 0;

  width: 100vw;
  height: calc(var(--vh, 1vh) * 100);

  display: flex;
  justify-content: center;
  align-items: center;

  background-color: #fff;
  box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.5);
  box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.2);
`;
const MobilePost = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @media (orientation: landscape) and (max-height: 480px) {
    flex-direction: row;
  }
`;
const MobileText = styled.div`
  width: 100%;
  //top height 64px
  //bottom height 40px
  //indicator 30px
  height: calc(100vh - 64px - 40px - 30px);
  height: calc(var(--vh, 1vh) * 100 - 64px - 40px - 30px);
  margin-bottom: 30px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  #content {
    text-align: start;
    overflow-y: scroll;
    overflow-wrap: break-word;
    white-space: pre-wrap;

    height: 0px;
    width: 100%;
    flex-grow: 1;
    padding: 20px 24px;

    /* font-weight: 500; */
    font-size: 20px;
    font-size: 18px;
    line-height: 1.3em;
  }

  @media (orientation: landscape) and (max-height: 480px) {
    width: calc(100vw - 200px);
    height: 100vh;
    height: calc(var(--vh, 1vh) * 100 - 30px);
    #content {
      padding: 24px 64px;
    }
  }
`;
const MobilePostInfo = styled.div`
  //component height = 64px
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  height: 64px;

  div {
    width: 80%;
    display: flex;
    justify-content: start;
    align-items: center;
  }

  @media (orientation: landscape) and (max-height: 480px) {
    background-color: whitesmoke;
    border-right: 2px solid rgba(0, 0, 0, 0.05);
    align-items: start;
    justify-content: space-between;

    width: 100%;

    padding: 20px 6px;
    flex-shrink: 0;
    > *:first-child {
      * {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      width: auto;
      height: 36px;
      span {
        font-weight: 500;
        font-size: 18px !important;
      }
      img {
        height: 32px;
        width: 32px;
      }
    }
    > *:nth-child(2) {
      display: flex;
      align-items: center;
      height: 36px;

      font-size: 14px !important;
    }

    width: 200px;
    /* height: calc(var(--vh, 1vh) * 30); */
    height: 30vh;
    height: 100vh;
  }
`;
