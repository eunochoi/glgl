import styled from "styled-components";
import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CommentFunction from "../../functions/reactQuery/Comment";
import useAlert from "./Alert";
import { createPortal } from "react-dom";

import Img from "./Img";

//mui
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Popper from "@mui/material/Popper";
import { Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import User from "../../functions/reactQuery/User";
import CircularProgress from "@mui/material/CircularProgress";
import ReplyQuery from "../../functions/reactQuery/Reply";

moment.locale("ko");

const Reply = ({ replyProps }: any) => {
  const [isCommentEdit, setCommentEdit] = useState<boolean>(false);

  const [commentEditContent, setCommentEditContent] = useState<string>(replyProps.content);

  const [morePop, setMorePop] = useState<null | HTMLElement>(null);

  const open = Boolean(morePop);
  const [timer, setTimer] = useState<NodeJS.Timeout>();

  const { Alert: CommentDeleteConfirm, openAlert: OpenCommentDeleteConfirm } = useAlert();

  const navigate = useNavigate();

  const user = User.get().data;

  const commentRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    commentRef.current?.focus();
  }, [isCommentEdit]);
  useEffect(() => {
    setCommentEditContent(replyProps.content);
  }, [replyProps]);

  //useMutation
  const editReply = ReplyQuery.edit();
  const deleteReply = ReplyQuery.delete();

  return (
    <CommentBox
      onClick={() => {
        setMorePop(null);
        clearTimeout(timer);
      }}
    >
      {createPortal(<CommentDeleteConfirm />, document.getElementById("modal_root") as HTMLElement)}

      <Popper style={{ zIndex: 5000 }} open={open} anchorEl={morePop} placement="top-end">
        <EditPopup>
          <Button
            size="small"
            color="inherit"
            onClick={() => {
              setMorePop(null);
              clearTimeout(timer);
              setCommentEdit((c) => !c);
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
              OpenCommentDeleteConfirm({
                mainText: "댓글을 삭제 하시겠습니까?",
                onSuccess: () => {
                  deleteReply.mutate({ replyId: replyProps.id });
                }
              });
            }}
          >
            <DeleteForeverIcon />
          </Button>
        </EditPopup>
      </Popper>
      <CommentInfo>
        <FlexDiv>
          {replyProps?.User?.profilePic ? (
            <ProfilePic
              onClick={() => {
                navigate(`/userinfo/${replyProps?.User?.id}/cat/0`);
              }}
              crop={true}
              alt="profilePic"
              src={`${replyProps?.User?.profilePic}`}
            />
          ) : (
            <ProfilePic
              onClick={() => {
                navigate(`/userinfo/${replyProps?.User?.id}/cat/0`);
              }}
              crop={true}
              alt="profilePic"
              src="/img/defaultProfilePic.png"
            />
          )}
          <UserNickname>{replyProps?.User?.nickname?.slice(0, 8)}</UserNickname>
        </FlexDiv>
        <FlexDiv>
          <CommentTime>{moment(replyProps?.createdAt).fromNow()}</CommentTime>
          {(user?.id === replyProps.UserId || user?.level === 10) && (
            <button
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
            </button>
          )}
        </FlexDiv>
      </CommentInfo>
      {isCommentEdit ? (
        <CommentEdit
          onSubmit={(e) => {
            e.preventDefault();
            if (commentEditContent.length > 60 || commentEditContent.length < 5)
              toast.warning("댓글은 최소 5자 최대 60자 입력이 가능합니다.");
            else {
              editReply.mutate(
                {
                  replyId: replyProps.id,
                  content: commentEditContent
                },
                {
                  onSuccess: () => {
                    setCommentEdit(false);
                  },
                  onError: () => {
                    setCommentEditContent(replyProps?.content);
                  }
                }
              );
            }
          }}
        >
          <input ref={commentRef} value={commentEditContent} onChange={(e) => setCommentEditContent(e.target.value)} />

          <CommentEditButton disabled={editReply.isLoading ? true : false}>
            {editReply.isLoading ? <CircularProgress size={24} color="inherit" /> : <CheckCircleIcon />}
          </CommentEditButton>

          <CommentEditButton
            onClick={() => {
              setCommentEdit(false);
              setCommentEditContent(replyProps?.content);
            }}
          >
            <CancelIcon color="error" />
          </CommentEditButton>
        </CommentEdit>
      ) : (
        <CommentText>{replyProps?.content}</CommentText>
      )}
    </CommentBox>
  );
};

export default Reply;

const ProfilePic = styled(Img)`
  width: 32px;
  height: 32px;
  margin-right: 10px;
  border-radius: 50px;
  background-color: white;

  border: 2px solid rgba(0, 0, 0, 0.1);
`;
const CommentEditButton = styled.button`
  padding: 4px 8px;
`;
const CommentEdit = styled.form`
  display: -webkit-box;
  display: flex;

  padding: 6px 0;
  width: 100%;
  input {
    font-size: 1em;

    flex-grow: 1;
    -webkit-box-flex: 1;
    width: 50%;

    border: 2px rgba(0, 0, 0, 0.1) solid;
    border-radius: 7px;
    padding: 2px 6px;
  }
  input:focus {
    outline: none;
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
  cursor: pointer;
  span {
    margin-right: 8px;
  }
  button {
    height: 100%;
    display: flex;
    align-items: center;
  }
`;
const CommentBox = styled.div`
  display: flex;
  flex-direction: column;

  padding: 4px 0px;
  /* border-top: 1px rgba(0, 0, 0, 0.05) solid;
  border-bottom: 1px rgba(43, 31, 31, 0.05) solid; */
`;
const CommentInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  /* padding: 0px 10px; */
  div:first-child {
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

const UserNickname = styled.span`
  font-weight: 500;
  /* font-weight: 600; */
  font-size: 1.1em;
`;
const CommentText = styled.span`
  display: flex;
  justify-content: start;
  padding: 10px 0;
  font-size: 18px;
  font-size: 16px;
  /* padding-bottom: 0px; */
`;
const CommentTime = styled.span`
  font-size: 1.1em;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.6);
`;
