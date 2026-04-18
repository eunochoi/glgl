import React, { useEffect } from "react";
import styled from "styled-components";
import { useState, useRef } from "react";
import { toast } from "react-toastify";
import Img from "./Img";

//style
import Animation from "../../styles/Animation";

//mui
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { Button } from "@mui/material";
import User from "../../functions/reactQuery/User";
import Upload from "../../functions/reactQuery/Upload";
import CircularProgress from "@mui/material/CircularProgress";
import { useModalStack } from "../../store/modalStack";
import { useBrowserCheck } from "../../store/borowserCheck";

interface setStateProps {
  setImageChangeModal: (b: boolean) => void;
}

const ProfileChangePopup = ({ setImageChangeModal }: setStateProps) => {
  const { push, pop, modalStack } = useModalStack();

  //useQuery
  const user = User.get().data;

  const [animation, setAnimation] = useState<"open" | "close" | "">("");
  const { browser } = useBrowserCheck();

  const [image, setImage] = useState<string>(user?.profilePic);
  const imageInput = useRef<HTMLInputElement>(null);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);

  //useMutatton
  const editProfilePic = User.editPic();
  const uploadImage = Upload.images();

  // const [timer, setTimer] = useState<NodeJS.Timeout>();

  const ButtonClose = () => {
    setAnimation("close");
    // setTimer(
    //   setTimeout(() => {
    //     history.back();
    //   }, 300)
    // );
  };

  //로컬에서 이미지 에러 처리
  const onChangeImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const imageFormData = new FormData();

      if (e.target.files[0].size > 5 * 1024 * 1024) {
        toast.error("이미지 파일은 5MB를 초과할 수 없습니다.");
        return null;
      }
      imageFormData.append("image", e.target.files[0]);
      uploadImage.mutate(imageFormData, {
        onSuccess: (res) => {
          setImage(res.data[0]);
        }
      });
    }
  };

  useEffect(() => {
    if (modalStack[modalStack.length - 1] === "#profilePicUpdate") {
      window.onpopstate = () => {
        console.log("pop: profile Pic change");
        // setAnimation("close");

        if (browser === "Safari") setImageChangeModal(false);
        else setAnimation("close");
      };
    }
  }, [modalStack.length]);

  useEffect(() => {
    push("#profilePicUpdate");
    setAnimation("open");
    // clearTimeout(timer);

    return () => {
      window.onpopstate = null;
      pop();
    };
  }, []);

  return (
    <PopupBG
      animation={animation}
      onTransitionEnd={() => {
        if (animation === "close") {
          setImageChangeModal(false);
        }
      }}
      onClick={() => {
        ButtonClose();
      }}
    >
      <PopupBox
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <input ref={imageInput} type="file" accept="image/*" name="image" hidden onChange={onChangeImages} />
        <span>프로필 이미지 변경</span>
        <ProfileImageBox>
          {image && !uploadImage.isLoading && <ProfileImage crop={true} src={`${image}`} alt="프로필 이미지" />}
          {uploadImage.isLoading && (
            <ProfileImage crop={true} src={`${process.env.PUBLIC_URL}/img/loading.gif`} alt="로딩" />
          )}
          {!image && !uploadImage.isLoading && (
            <ProfileImage crop={true} src={`${process.env.PUBLIC_URL}/img/defaultProfilePic.png`} alt="프로필 이미지" />
          )}
          <Button
            color="error"
            disabled={uploadLoading}
            onClick={() => {
              setImage("");
            }}
          >
            <DeleteForeverIcon />
          </Button>
        </ProfileImageBox>

        <ButtonArea>
          <button
            onClick={() => {
              ButtonClose();
            }}
          >
            <CancelIcon />
            <span>취소</span>
          </button>
          <FlexBox>
            <button disabled={uploadLoading} onClick={() => imageInput.current?.click()}>
              <InsertPhotoIcon />
              <span>이미지 업로드</span>
            </button>
            <button
              disabled={uploadLoading}
              onClick={() => {
                setUploadLoading(true);

                editProfilePic.mutate(
                  { profilePic: image },
                  {
                    onSuccess: () => {
                      setAnimation("close");
                      setUploadLoading(false);
                    }
                  }
                );
                console.log(image);
              }}
            >
              {uploadLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <>
                  <CheckCircleIcon />
                  <span>확인</span>
                </>
              )}
            </button>
          </FlexBox>
        </ButtonArea>
      </PopupBox>
    </PopupBG>
  );
};

export default ProfileChangePopup;
const FlexBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
const ProfileImageBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const ButtonArea = styled.div`
  width: 100%;
  height: 50px;
  background-color: #cbdbf3;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 0px 10px;

  button {
    display: flex;
    justify-content: center;
    align-items: center;

    margin: 0 4px;

    font-size: 18px;
    color: rgba(0, 0, 0, 0.7);
    span {
      font-weight: 500;
      margin-left: 6px;
    }
  }
`;
const ProfileImage = styled(Img)`
  width: 200px;
  height: 200px;
  border-radius: 200px;

  background-color: white;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.3);

  margin-bottom: 5px;
`;
const PopupBox = styled.div`
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  height: 500px;
  width: 400px;
  border-radius: 5px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

  background-color: white;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);

  > span {
    font-size: 24px;
    color: rgba(0, 0, 0, 0.8);
    font-weight: 600;
    margin-top: 50px;
  }
  @media (orientation: portrait) or (max-height: 480px) {
    width: 95vw;
  }
  @media (max-height: 480px) {
    width: 100vw;
    height: 100vh;
  }
`;
const PopupBG = styled.div<{ animation: string }>`
  opacity: 0;
  opacity: ${(props) => (props.animation === "open" ? 1 : 0)};
  transition: linear 0.3s all;

  z-index: 1000;
  position: fixed;
  top: 0;
  left: 0;

  width: 100vw;
  height: 100vh;

  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
`;
