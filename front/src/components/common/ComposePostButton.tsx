import React, { useContext } from "react";
import styled from "styled-components/macro";
import PostAddIcon from "@mui/icons-material/PostAdd";
import Animation from "../../styles/Animation";
import User from "../../functions/reactQuery/User";
import InputPopup from "./PostInputPopup";
import { PostInputModalContext } from "../../context/PostInputModalContext";

const ADMIN_LEVEL = 10;

interface ComposePostButtonProps {
  postType: 0 | 1 | 2;
}

const ComposePostButton = ({ postType }: ComposePostButtonProps) => {
  const postModal = useContext(PostInputModalContext);
  const user = User.get().data;

  const canPost =
    postType === 0
      ? !!user && user.level >= ADMIN_LEVEL && user.level !== 0
      : !!user && user.level !== 0 && (postType === 1 || postType === 2);

  if (!postModal || !canPost) return null;

  const { postInputOpen, setPostInputOpen } = postModal;

  const openModal = () => {
    history.pushState({ page: "modal" }, "", "");
    setPostInputOpen(true);
  };

  return (
    <>
      {postInputOpen && <InputPopup setPostInputOpen={setPostInputOpen} postType={postType} />}
      <FabButton id="mobileAddPost" type="button" onClick={openModal}>
        <PostAddIcon fontSize="medium" />
      </FabButton>
    </>
  );
};

export default ComposePostButton;

const FabButton = styled.button`
  animation: ${Animation.smoothAppear} 0.3s ease-in-out;
  transition: 0.3s ease-in-out all;
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: #c7d7ff;
    }
  }

  width: 48px;
  height: 48px;

  padding: 0px;
  margin-top: 6px;
  border-radius: 100px;

  @media (orientation: portrait) and (max-width: 480px) {
    margin-top: 6px;
  }

  color: rgba(0, 0, 0, 0.6);
  border: solid 2px rgba(0, 0, 0, 0.05);
  background-color: #f3e0f1;
`;
