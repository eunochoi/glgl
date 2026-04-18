import React, { useEffect, useRef, useState } from "react";
import InputForm from "../../styles/InputForm";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/esm/locale";
import useAlert from "./Alert";
import { useModalStack } from "../../store/modalStack";
import { createPortal } from "react-dom";

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

interface props {
  setPostInputOpen: (b: boolean) => void;
}

const InputPopup = ({ setPostInputOpen }: props) => {
  const { push, pop, modalStack } = useModalStack();

  const [animation, setAnimation] = useState<"open" | "close" | "">("");

  const params = useParams();
  const inputType = params.type ? parseInt(params.type) : 0;
  const placeholders = ["Notice Post", "Tip Post", "Free Post"];
  const [content, setContent] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);

  const [postOptionToggle, setPostOptionToggle] = useState<number>(-1);
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [link, setLink] = useState<string>("");
  const isInfoPost = inputType === 1;
  const imageInput = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { Alert: CancelAlert, openAlert: openCancelAlert } = useAlert();

  //useMutation
  const addPost = Post.add();
  const uploadImages = Upload.images();

  const postCreateSubmit = () => {
    //컨텐츠 조건
    if (content.length < 8 || content.length > 2200) {
      return toast.warning("게시글은 최소 8자 최대 2200자 작성이 가능합니다.");
    }

    let startDate = null;
    let endDate = null;

    //날짜 조건
    if (inputType === 1) {
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
    return addPost.mutate(
      {
        content,
        images,
        type: inputType,
        start: startDate,
        end: endDate,
        link
      },
      {
        onSuccess: () => {
          setPostInputOpen(false);
          history.back();
        }
      }
    );
  };

  //로컬에서 이미지 등록 에러 처리
  const onChangeImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      console.log(e.target.files[0].size);
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
    if (modalStack[modalStack.length - 1] === "#addpost") {
      window.onpopstate = () => {
        console.log("pop: add post");

        openCancelAlert({
          mainText: "게시글 등록을 중단하시겠습니까?",
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
    push("#addpost");
    window.document.body.style.overflow = "hidden";
    return () => {
      window.onpopstate = null;
      window.document.body.style.overflow = "auto";
      pop();
    };
  }, []);

  return (
    <InputForm.InputBG
      onTransitionEnd={() => {
        if (animation === "close") {
          setPostInputOpen(false);
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
          placeholder={placeholders[inputType]}
          onChange={(e) => {
            setContent(e.target.value);
          }}
          value={content}
        ></InputForm.TextArea>

        {(images.length > 0 || uploadImages.isLoading) && (
          <InputForm.InputImageWrapper>
            {images.map((v, i) => (
              <InputForm.InputImageBox key={i}>
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

            {addPost.isLoading ? (
              <CircularProgress style={{ margin: "0 8px" }} color="inherit" size={24} />
            ) : (
              <InputForm.FlexButton onClick={() => postCreateSubmit()}>
                <PostAddIcon />
                <span>등록</span>
              </InputForm.FlexButton>
            )}
          </InputForm.ButtonWrapper>
        </InputForm.ButtonArea>
      </InputForm.InputWrapper>
    </InputForm.InputBG>
  );
};

export default InputPopup;
