import React, { useEffect, useRef, useState } from "react";
import InputForm from "../../styles/InputForm";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/esm/locale";
import { createPortal } from "react-dom";

import styled from "styled-components/macro";
import Img from "./Img";
import useAlert from "./Alert";
import { useModalStack } from "../../store/modalStack";

//mui
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import PostAddIcon from "@mui/icons-material/PostAdd";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CancelIcon from "@mui/icons-material/Cancel";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Upload from "../../functions/reactQuery/Upload";
import Post from "../../functions/reactQuery/Post";
import Chip from "@mui/joy/Chip";
import ChipDelete from "@mui/joy/ChipDelete";
import Box from "@mui/joy/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useBrowserCheck } from "../../store/borowserCheck";

interface serverImages {
  src: string;
}
interface serverPostData {
  type: number;
  id: number;
  content: string;
  images: serverImages[];
  start: Date;
  end: Date;
  link: string;
}

interface props {
  setPostEdit: (b: boolean) => void;
  postProps: serverPostData;
}

const PostEditPopup = ({ setPostEdit, postProps }: props) => {
  const { push, pop, modalStack } = useModalStack();
  const { browser } = useBrowserCheck();

  const [animation, setAnimation] = useState<"open" | "close" | "">("");

  const placeholders = ["Notice Post", "Tip Post", "Free Post"];
  const [content, setContent] = useState<string>(postProps.content);
  const [images, setImages] = useState<string[]>(postProps.images.map((v) => v.src));
  const imageInput = useRef<HTMLInputElement>(null);

  const [postOptionToggle, setPostOptionToggle] = useState<number>(-1);
  const [start, setStart] = useState<Date | null>(postProps.start ? new Date(postProps.start) : null);
  const [end, setEnd] = useState<Date | null>(postProps.end ? new Date(postProps.end) : null);

  const [link, setLink] = useState<string>(postProps.link);
  const isInfoPost = postProps.type === 1;

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { Alert: CancelAlert, openAlert: openCancelAlert } = useAlert();

  //useMutation
  const editPost = Post.edit();
  const uploadImages = Upload.images();

  //function

  const postEditSubmit = () => {
    //컨텐츠 조건
    if (content.length < 8 || content.length > 2200) {
      return toast.warning("게시글은 최소 8자 최대 2200자 작성이 가능합니다.");
    }

    let startDate = null;
    let endDate = null;

    //날짜 조건
    if (postProps.type === 1) {
      if ((start !== null && end === null) || (start === null && end !== null)) {
        //start, end 둘 중 하나만 null인 경우 //01 10
        return toast.warning("공유기간 설정이 올바르지 않습니다.");
      }
      if (start !== null && end !== null && start > end) {
        //start, end 둘 다 입력되었지만 start가 더 큰경우
        return toast.warning("공유기간 설정이 올바르지 않습니다.");
      }
      if (start !== null && end !== null) {
        //start, end 둘 다 입력 된 경우
        const startY = start.getFullYear();
        const startM = start.getMonth();
        const startD = start.getDate();
        startDate = new Date(startY, startM, startD, 0, 0, 0);

        const endY = end.getFullYear();
        const endM = end.getMonth();
        const endD = end.getDate();
        endDate = new Date(endY, endM, endD, 0, 0, 0);
      }
    }
    //기간 x 포스트, 기간 입력이 안된 기간 o 포스트
    return editPost.mutate(
      {
        id: postProps.id,
        data: {
          content,
          images,
          type: postProps.type,
          id: postProps.id,
          start: startDate,
          end: endDate,
          link
        }
      },
      {
        onSuccess: () => {
          setPostEdit(false);
          history.back();
        }
      }
    );
  };
  const onChangeImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    //로컬에서 이미지 에러 처리
    if (e.target.files) {
      const imageFormData = new FormData();

      //게시글 최대 이미지 개수 제한
      if (images.length + e.target.files.length > 10) {
        toast.error("이미지 파일은 최대 10개까지 삽입 가능합니다.");
        return null;
      }

      //개별 이미지 크기 제한
      const isOverSize = Array.from(e.target.files).find((file) => {
        if (file.size <= 5 * 1024 * 1024) {
          imageFormData.append("image", file);
        } else {
          return true;
        }
      });

      if (isOverSize) {
        toast.error("선택된 이미지 중 5MB를 초과하는 이미지가 존재합니다.");
        return null;
      }
      uploadImages.mutate(imageFormData, {
        onSuccess: (res) => {
          setImages([...images, ...res.data]);
        }
      });
    }
  };

  useEffect(() => {
    if (modalStack[modalStack.length - 1] === "#editpost") {
      window.onpopstate = () => {
        console.log("pop: edit post");

        openCancelAlert({
          mainText: "게시글 수정을 중단하시겠습니까?",
          onSuccess: () => {
            setAnimation("close");
          },
          onCancel: () => {
            history.pushState({ page: "modal" }, "", "");
          }
        });
      };
    }
  }, [modalStack.length]);

  useEffect(() => {
    setAnimation("open");
    inputRef.current?.focus();
    push("#editpost");
    window.document.body.style.overflow = "hidden";
    return () => {
      window.onpopstate = null;
      window.document.body.style.overflow = "auto";
      pop();
    };
  }, []);

  return (
    <InputForm.EditBG
      onTransitionEnd={() => {
        if (animation === "close") {
          setPostEdit(false);
        }
      }}
      animation={animation}
      onClick={() => history.back()}
    >
      {createPortal(<CancelAlert />, document.getElementById("modal_root") as HTMLElement)}

      <InputForm.InputWrapper animation={animation} onClick={(e) => e.stopPropagation()}>
        <InputForm.PostOptionWrapper>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {isInfoPost && (
              <Chip
                sx={{
                  "--Chip-minHeight": "36px"
                }}
                startDecorator={<CalendarMonthIcon />}
                onClick={() => {
                  setPostOptionToggle(0);
                }}
                size="lg"
                variant="soft"
                color={postOptionToggle === 0 ? "primary" : "neutral"}
                endDecorator={
                  postOptionToggle === 0 ? (
                    <ChipDelete
                      onDelete={() => {
                        setStart(null);
                        setEnd(null);
                        setPostOptionToggle(-1);
                      }}
                    />
                  ) : (
                    <></>
                  )
                }
              >
                공유 기간
              </Chip>
            )}
            <Chip
              sx={{
                "--Chip-minHeight": "36px"
              }}
              startDecorator={<InsertLinkIcon />}
              onClick={() => {
                setPostOptionToggle(1);
              }}
              size="lg"
              variant="soft"
              color={postOptionToggle === 1 ? "primary" : "neutral"}
              endDecorator={
                postOptionToggle === 1 ? (
                  <ChipDelete
                    onDelete={() => {
                      setLink("");
                      setPostOptionToggle(-1);
                    }}
                  />
                ) : (
                  <></>
                )
              }
            >
              링크
            </Chip>
          </Box>

          {
            //start, end date
            postOptionToggle === 0 && (
              <InputForm.PostOptionValue>
                <DatePicker
                  calendarStartDay={1}
                  locale={ko}
                  dateFormat="yy년 MM월 dd일"
                  selectsStart
                  selected={start}
                  startDate={start}
                  endDate={end}
                  customInput={
                    start ? (
                      <InputForm.DateButton>
                        {start?.getFullYear()}년 {start?.getMonth() + 1}월 {start?.getDate()}일
                      </InputForm.DateButton>
                    ) : (
                      <InputForm.DateButton>공유 시작일</InputForm.DateButton>
                    )
                  }
                  onChange={(date: Date) => setStart(date)}
                />
                <MoreHorizIcon color="inherit" />
                <DatePicker
                  calendarStartDay={1}
                  locale={ko}
                  dateFormat="yy년 MM월 dd일"
                  selectsEnd
                  selected={end}
                  startDate={start}
                  endDate={end}
                  customInput={
                    end ? (
                      <InputForm.DateButton>
                        {end?.getFullYear()}년 {end?.getMonth() + 1}월 {end?.getDate()}일
                      </InputForm.DateButton>
                    ) : (
                      <InputForm.DateButton>공유 종료일</InputForm.DateButton>
                    )
                  }
                  onChange={(date: Date) => setEnd(date)}
                />
              </InputForm.PostOptionValue>
            )
          }
          {
            //link
            postOptionToggle === 1 && (
              <InputForm.PostOptionValue>
                <input placeholder="https://www.url.com" value={link} onChange={(e) => setLink(e.target.value)}></input>
              </InputForm.PostOptionValue>
            )
          }
        </InputForm.PostOptionWrapper>
        <InputForm.TextArea
          ref={inputRef}
          minLength={12}
          placeholder={placeholders[postProps.type]}
          onChange={(e) => {
            setContent(e.target.value);
          }}
          value={content}
        ></InputForm.TextArea>
        {(images?.length > 0 || uploadImages.isLoading) && (
          <InputForm.InputImageWrapper>
            {images.map((v, i) => (
              <InputForm.InputImageBox key={i + v}>
                <InputForm.InputImage crop={true} src={`${v}`} alt={v} />

                <InputForm.ImageDeleteButton
                  onClick={() => {
                    const tempImages = [...images];
                    tempImages.splice(i, 1);
                    setImages(tempImages);
                  }}
                >
                  <InputForm.ColorIcon>
                    <DeleteForeverIcon />
                  </InputForm.ColorIcon>
                </InputForm.ImageDeleteButton>
              </InputForm.InputImageBox>
            ))}
            {uploadImages.isLoading && (
              <InputForm.LoadingBox>
                <CircularProgress color="inherit" size={64} />
              </InputForm.LoadingBox>
            )}
          </InputForm.InputImageWrapper>
        )}
        <InputForm.ButtonArea>
          <input ref={imageInput} type="file" accept="image/*" name="image" multiple hidden onChange={onChangeImages} />
          <InputForm.FlexButton onClick={() => history.back()}>
            <CancelIcon />
            <span>취소</span>
          </InputForm.FlexButton>
          <InputForm.ButtonWrapper>
            <InputForm.FlexButton onClick={() => imageInput.current?.click()}>
              <InsertPhotoIcon />
              <span>이미지 삽입</span>
            </InputForm.FlexButton>
            {editPost.isLoading ? (
              <CircularProgress style={{ margin: "0 8px" }} color="inherit" size={24} />
            ) : (
              <InputForm.FlexButton onClick={() => postEditSubmit()}>
                <PostAddIcon />
                <span>수정</span>
              </InputForm.FlexButton>
            )}
          </InputForm.ButtonWrapper>
        </InputForm.ButtonArea>
      </InputForm.InputWrapper>
    </InputForm.EditBG>
  );
};

export default PostEditPopup;

const ImageSC = styled(Img)`
  margin-left: 24px;
  margin-left: 24px;
  padding-left: 24px;
  background-color: red;
`;
