import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import moment from "moment";
import "moment/locale/ko";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Clipboard from "react-clipboard.js";

//components
import PostEditPopup from "./PostEditPopup";
import PostZoom from "../PostZoom";
import Animation from "../../styles/Animation";
import CoustomCarousel from "./CustomCarousel";
import Img from "./Img";

import useAlert from "./Alert";

//mui
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Popper from "@mui/material/Popper";
import { Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import MessageIcon from "@mui/icons-material/Message";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import LinkIcon from "@mui/icons-material/Link";

import PostFunction from "../../functions/reactQuery/Post";
import User from "../../functions/reactQuery/User";
import { createPortal } from "react-dom";
import Comments from "./Comments";

interface Image {
  src: string;
}

const Post = ({ postProps }: any) => {
  moment.locale("ko");
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const user = User.get().data;

  const [isPostEdit, setPostEdit] = useState<boolean>(false);
  const [isCommentsOpen, setCommentsOpen] = useState<boolean>(false);
  const [morePop, setMorePop] = useState<null | HTMLElement>(null);
  const [isZoom, setZoom] = useState<boolean>(false);

  const isLiked = postProps?.Likers?.find((v: any) => v.id === user?.id);
  const isMyPost = user?.id === postProps?.UserId;

  const postHaveDate = postProps?.start && postProps?.end;
  const postHaveLink = postProps?.link && true;

  const { Alert: PostDeleteConfirm, openAlert: openDeleteConfirm } = useAlert();

  const open = Boolean(morePop);
  const [timer, setTimer] = useState<NodeJS.Timeout>();

  const makeCorectUrl = (url: string) => {
    url = url.toLowerCase();
    return "https://" + url.replace("https:/", "").replace("http:/", "");
  };

  //useMutation
  const like = PostFunction.like();
  const disLike = PostFunction.disLike();
  const deletePost = PostFunction.delete();

  //포스트 팝업 뜬 경우 백그라운드 스크롤 방지
  useEffect(() => {
    if (isZoom) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [isZoom]);
  useEffect(() => {
    if (isPostEdit) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [isPostEdit]);

  const navigate = useNavigate();

  //관심 상태 포스트 줌 상태에서 좋아요 해제면 다음 게시글이 줌되는 오류 해결
  useEffect(() => {
    setZoom(false);
  }, [postProps.id]);
  //댓글 창 열렸을때 스크롤 방지
  useEffect(() => {
    if (isCommentsOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [isCommentsOpen]);

  return (
    <>
      {postProps.UserId && (
        <PostWrapper onClick={() => setMorePop(null)}>
          {createPortal(<PostDeleteConfirm></PostDeleteConfirm>, document.getElementById("modal_root") as HTMLElement)}
          {createPortal(
            <>{isZoom && <PostZoom setZoom={setZoom} postProps={postProps} />}</>,
            document.getElementById("front_component_root") as HTMLElement
          )}
          {createPortal(
            <>{isCommentsOpen && <Comments postProps={postProps} setCommentsOpen={setCommentsOpen} />}</>,
            document.getElementById("front_component_root") as HTMLElement
          )}
          {/* 포스트 수정 팝업 */}
          {createPortal(
            isPostEdit ? (
              <PostEditPopup
                setPostEdit={setPostEdit}
                postProps={{
                  type: postProps.type,
                  id: postProps.id,
                  content: postProps.content,
                  images: postProps.Images,
                  start: postProps?.start,
                  end: postProps?.end,
                  link: postProps?.link
                }}
              />
            ) : null,
            document.getElementById("front_component_root") as HTMLElement
          )}

          <Popper open={open} anchorEl={morePop} placement="top-end">
            <EditPopup>
              <Button
                size="small"
                color="inherit"
                onClick={() => {
                  setMorePop(null);
                  clearTimeout(timer);

                  history.pushState({ page: "modal" }, "", "");
                  setPostEdit(true);
                }}
              >
                <EditIcon />
              </Button>
              <Button
                size="small"
                color="error"
                onClick={() => {
                  setMorePop(null);
                  clearTimeout(timer);
                  openDeleteConfirm({
                    mainText: "게시글을 삭제 하시겠습니까?",
                    onSuccess: () => {
                      deletePost.mutate(postProps?.id);
                    }
                  });
                }}
              >
                <DeleteForeverIcon />
              </Button>
            </EditPopup>
          </Popper>

          <PostInfoWrapper>
            <div
              onClick={() => {
                navigate(`/userinfo/${postProps?.User?.id}/cat/0`);

                window.scrollTo({
                  top: 0,
                  left: 0,
                  behavior: "smooth"
                });
              }}
            >
              {postProps?.User?.profilePic ? (
                <ProfilePic crop={true} alt="userProfilePic" src={`${postProps?.User?.profilePic}`} />
              ) : (
                <ProfilePic
                  crop={true}
                  alt="userProfilePic"
                  src={`${process.env.PUBLIC_URL}/img/defaultProfilePic.png`}
                />
              )}
              <span>{postProps?.User?.nickname?.slice(0, 8)}</span>
            </div>
            <span>{moment(postProps?.createdAt).fromNow()}</span>
          </PostInfoWrapper>

          <CoustomCarousel indicator={postProps.Images.length === 1 ? false : true}>
            {postProps.Images?.map((v: Image, i: number) => (
              <div
                key={i}
                onClick={() => {
                  history.pushState({ page: "modal" }, "", "");
                  setZoom(true);
                }}
              >
                <Image crop={true} src={`${v?.src}`} alt="img" />
              </div>
            ))}
          </CoustomCarousel>

          <TextWrapper
            onClick={() => {
              history.pushState({ page: "modal" }, "", "");
              setZoom(true);
            }}
          >
            {postProps?.content?.split(/(#[^\s#]{1,15})/g).map((v: string, i: number) => {
              if (v.match(/(#[^\s#]{1,15})/)) {
                return <Hashtag key={i}>{v}</Hashtag>;
              }
              return v;
            })}
          </TextWrapper>
          {(postHaveDate || postHaveLink) && (
            <SubContentWrapper>
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
            </SubContentWrapper>
          )}

          {/* 토글 버튼(좋아요, 댓글창, 수정, 삭제) */}
          <ToggleWrapper>
            {postProps.type === 0 && (
              <ToggleButton
                onClick={() => {
                  if (!isLiked) {
                    like.mutate(postProps.id);
                  } else {
                    disLike.mutate(postProps.id);
                  }
                }}
              >
                {isLiked ? <FavoriteIcon style={{ color: "#D5A8D0" }} /> : <FavoriteBorderIcon />}
                <span>{postProps?.Likers?.length}</span>
              </ToggleButton>
            )}
            {postProps.type !== 0 && (
              <FlexDiv>
                {/* like toggle */}
                <ToggleButton
                  onClick={() => {
                    if (!isLiked) {
                      like.mutate(postProps.id);
                    } else {
                      disLike.mutate(postProps.id);
                    }
                  }}
                >
                  {postProps.type === 1 && (
                    <>{isLiked ? <BookmarkIcon style={{ color: "#a9aed4" }} /> : <BookmarkBorderIcon />}</>
                  )}
                  {postProps.type === 2 && (
                    <>{isLiked ? <FavoriteIcon style={{ color: "#D5A8D0" }} /> : <FavoriteBorderIcon />}</>
                  )}
                  <span>{postProps?.Likers?.length}</span>
                </ToggleButton>
                {/* comment toggle */}
                <ToggleButton
                  onClick={() => {
                    setCommentsOpen(true);
                    setTimeout(() => {
                      history.pushState({ page: "modal" }, "", "");
                    }, 100);
                  }}
                >
                  <MessageIcon />
                  <span>{postProps?.Comments?.length}</span>
                </ToggleButton>
              </FlexDiv>
            )}

            <FlexDiv>
              <Clipboard
                onSuccess={() => toast.success("공유 URL이 클립보드에 복사되었습니다.")}
                component="a"
                data-clipboard-text={`${BASE_URL}/postview/${postProps.id}`}
              >
                <ToggleButton>
                  <LinkIcon id="link" fontSize="medium" />
                  {/* <span>URL</span> */}
                </ToggleButton>
              </Clipboard>

              {(isMyPost || user?.level === 10) && (
                <ToggleButton
                  onClick={(event: React.MouseEvent<HTMLElement>) => {
                    event.stopPropagation();
                    if (!morePop) {
                      setMorePop(event.currentTarget);
                      setTimer(
                        setTimeout(() => {
                          setMorePop(null);
                        }, 1500)
                      );
                    } else {
                      setMorePop(null);
                      clearTimeout(timer);
                    }
                  }}
                >
                  <MoreVertIcon />
                </ToggleButton>
              )}
            </FlexDiv>
          </ToggleWrapper>
        </PostWrapper>
      )}
    </>
  );
};

export default Post;

const Hashtag = styled.span`
  color: #5e89c7;
  /* font-weight: 500; */
`;

const Image = styled(Img)`
  width: 100%;
  height: 400px;

  transition: all ease-in-out 1s;
  @media (orientation: portrait) {
    height: 350px;
  }
  @media (orientation: landscape) and (max-height: 480px) {
    height: 300px;
  }
`;

const SubContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;

  font-size: 18px;

  margin: 10px 20px;
  margin-top: 0;
  > div {
    display: flex;
    justify-content: start;
    align-items: center;
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
    overflow: scroll;
    white-space: nowrap;
    color: #5974af;
    text-decoration-line: underline;
    margin-left: 4px;
  }
`;
const More = styled.div`
  margin: 16px;
  margin-top: 0px;

  display: flex;
  justify-content: center;
  > button {
    padding: 6px 16px;
    border-radius: 30px;
    /* width: 50px; */
    font-size: 14px;
    /* font-weight: 800; */

    background-color: rgba(0, 0, 0, 0.1);
    color: rgba(0, 0, 0, 0.6);
  }
`;

const EditPopup = styled.div`
  margin-bottom: 8px;
  padding: 6px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0px 2px 7px rgba(0, 0, 0, 0.3);
`;

const FlexDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
const PostWrapper = styled.div`
  animation: ${Animation.smoothAppear} 1s ease-in-out;
  display: flex;
  flex-direction: column;

  transition: all ease-in-out 0.5s;

  height: auto;
  width: 500px;
  width: 550px;
  max-width: 500px;
  max-width: 550px;

  border-radius: 6px;

  /* box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1); */

  background-color: rgba(0, 0, 0, 0.02);
  border: 2px rgba(0, 0, 0, 0.07) solid;
  background-color: #fafafa;

  /* margin: 3px 10px; */
  padding-bottom: 20px;
  margin-bottom: 30px;
  /* border-radius: 7px; */
  @media (orientation: portrait) or (max-height: 480px) {
    width: 92vw;
    max-width: auto;
    max-width: 92vw;
    &:last-child {
      margin-bottom: 150px;
    }
    /* width: 450px; */
    /* height: auto; */
  }
  @media (orientation: landscape) and (max-height: 480px) {
    /* width: 480px; */
    max-width: 100%;
    width: 100%;
  }
`;

const PostInfoWrapper = styled.div`
  margin: 20px;
  margin-bottom: 10px;

  display: flex;
  justify-content: space-between;
  align-items: center;
  div {
    display: flex;
    justify-content: center;
    align-items: center;
    span {
      font-weight: 500;
      /* font-weight: 600; */
      height: 100%;
      font-size: 1.2em;
      line-height: 1.3em;
      max-width: 50vw;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    button {
      margin-left: 10px;
    }
  }
  > span:last-child {
    color: rgba(0, 0, 0, 0.6);
  }
`;

const TextWrapper = styled.div`
  cursor: pointer;
  //줄바꿈 표시
  white-space: pre-wrap;
  overflow-wrap: break-word;
  /* max-height: 100px; */
  overflow-y: scroll;
  text-overflow: ellipsis;

  line-height: 1.3em;
  font-size: 18px;
  font-size: 16px;

  margin: 28px 20px;

  display: -webkit-box;
  -webkit-line-clamp: 4; /* 원하는 줄 수 표시 */
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (orientation: portrait) or (max-height: 480px) {
    font-size: 1.1em;
    font-size: 16px;
  }
`;

const ToggleWrapper = styled.div`
  margin: 5px 20px;
  /* margin-top: 5px; */

  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const ToggleButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;

  span {
    margin-left: 4px;
    margin-right: 12px;
    font-size: 1.3em;
    font-size: 16px;
    font-weight: 500;
    /* color: grey; */
  }
`;

const ProfilePic = styled(Img)`
  width: 40px;
  height: 40px;
  margin-right: 10px;
  border-radius: 50px;
  background-color: white;

  border: 2px solid rgba(0, 0, 0, 0.1);
`;
