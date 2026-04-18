import styled from "styled-components";
import ImageList from "@mui/material/ImageList";
import Animation from "../../../styles/Animation";

export const ImageListSC = styled(ImageList)`
  margin-bottom: 12px;
`;

export const Images = styled.div`
  animation: ${Animation.smoothAppear} 1s ease-in-out;

  width: 70%;
  min-height: 100vh;
  .MuiImageListItem-img {
    border: solid 2px rgba(0, 0, 0, 0.05);
    border-radius: 8px;
  }

  @media (orientation: portrait) or (max-height: 480px) {
    width: 92vw;
  }
  @media (orientation: landscape) and (max-height: 480px) {
    width: 80%;
  }
`;

export const Wrapper = styled.div`
  animation: ${Animation.smoothAppear} 0.5s ease-in-out;

  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const TextWrapper = styled.div`
  width: 70%;
  padding-top: 64px;
  padding-bottom: 24px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;

  @media (orientation: portrait) or (max-height: 480px) {
    width: 100%;
    padding-top: 72px;
    margin-top: 48px;
    padding-bottom: 24px;
  }
  @media (orientation: landscape) and (max-height: 480px) {
    width: 80%;
    padding-left: 0;
    margin-top: 0;
    padding-top: 24px;
  }
`;

export const Pill = {
  Wrapper: styled.div`
    z-index: 80;
    position: sticky;
    top: 0px;

    background-color: white;

    display: flex;
    justify-content: start;
    align-items: center;

    padding-top: 24px;
    padding-bottom: 24px;
    margin-bottom: 12px;

    width: 70%;
    overflow-x: scroll;

    @media (orientation: portrait) or (max-height: 480px) {
      top: 46px;
      width: 100%;
      padding: 12px 4vw;
    }
    @media (orientation: landscape) and (max-height: 480px) {
      width: 80%;
      padding-left: 0;
      padding-right: 0;
      top: 0px;
    }

    -ms-overflow-style: none;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  `,
  Sub: styled.button<{ toggle: number }>`
    flex-shrink: 0;
    transition: all ease-in-out 0.5s;
    height: 32px;
    padding: 0px 16px;
    margin-right: 8px;
    border-radius: 100px;
    border: solid 2px rgba(0, 0, 0, 0.05);

    font-size: 18px;
    font-weight: 500;

    display: flex;
    align-items: center;
    justify-content: center;

    color: #464b53;
    background-color: #e3ecf9;
    > span {
      margin-left: 4px;
      font-weight: 500;
    }
    &:nth-child(${(props) => props.toggle + 1}) {
      background-color: #f3e0f1;
    }
  `
};
