import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

//styles
import Animation from "../styles/Animation";
import ExtensionRoundedIcon from "@mui/icons-material/ExtensionRounded";

const Start = () => {
  const navigate = useNavigate();

  const start = () => {
    navigate("/login");
  };

  return (
    <>
      <BG />
      <BG2 />

      <StartWrapper>
        <Title>
          <div>
            <span>G</span>
            <span>ood Lock</span>
          </div>
          <div>
            <span>G</span>
            <span>od Lock</span>
          </div>
        </Title>
        <TextBox>
          <span>나만의 감성 더하기, 굿락갓락</span>
          <ExtensionRoundedIcon fontSize="inherit" />
        </TextBox>
        <StartButton
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            start();
          }}
        >
          함께하기
        </StartButton>

        <StartImg alt="start_image" src={`${process.env.PUBLIC_URL}/img/start_image.png`}></StartImg>
      </StartWrapper>

      <Footer>
        <span>Contact : godlock.info@gmail.com</span>
        <span>
          <a href="http://www.freepik.com">Art designed by rawpixel.com / Freepik</a>
        </span>
      </Footer>
    </>
  );
};

export default Start;

const TextBox = styled.div`
  /* font-family: OAGothic-ExtraBold; */
  z-index: 99;
  line-height: 36px;
  font-size: 24px;
  color: #636b80;

  display: flex;
  justify-content: start;
  align-items: center;

  margin: 64px 0;

  span {
    text-shadow: 0px 0px 10px #c7d7ff;

    white-space: pre-line;
    font-weight: 600;
    margin-right: 5px;
  }

  @media (orientation: portrait) or (max-height: 480px) {
    margin: 48px 0;
  }
  @media (orientation: landscape) and (max-height: 480px) {
    margin: 24px 0;
    span {
      font-size: 20px;
      line-height: 24px;
    }
  }
`;

const Title = styled.span`
  z-index: 99;
  > div {
    margin-left: -10px;
    span {
      text-shadow: 0px 0px 10px #c7d7ff;
    }
    span:nth-child(1) {
      font-family: OAGothic-ExtraBold;
      font-size: 96px;
      font-weight: 700;
      color: rgba(0, 0, 0, 0.7);
      @media (orientation: portrait) or (max-height: 480px) {
        font-size: 72px;
      }
      @media (orientation: landscape) and (max-height: 480px) {
        font-size: 58px;
      }
    }
    span:nth-child(2) {
      /* font-family: OAGothic-ExtraBold; */
      font-size: 72px;
      font-weight: 600;
      color: #778199;
      @media (orientation: portrait) or (max-height: 480px) {
        font-size: 52px;
      }
      @media (orientation: landscape) and (max-height: 480px) {
        font-size: 42px;
      }
    }
  }
`;

const BG = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  background-color: #c7d7ff;
`;
const BG2 = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 30vh;
  @media (orientation: portrait) or (max-height: 480px) {
    height: 20vh;
  }

  background-color: rgba(0, 0, 0, 0.2);
`;
const Footer = styled.div`
  z-index: 19;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 32px;
  height: auto;

  font-size: 12px;
  background-color: rgba(0, 0, 0, 0.2);
  color: rgba(0, 0, 0, 0.5);

  display: flex;
  justify-content: end;
  align-items: center;
  /* align-items: end; */
  padding: 6px 12px;

  span:first-child {
    margin-right: 12px;
  }

  @media (orientation: portrait) or (max-height: 480px) {
    font-size: 10px;
    flex-direction: column;
    justify-content: center;
    align-items: end;
    span:first-child {
      margin-right: 0px;
      margin-bottom: 4px;
    }
  }
`;

const StartWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;

  padding-top: calc(var(--vh, 1vh) * 25);
  padding-left: 10vw;
  @media (orientation: portrait) or (max-height: 480px) {
    width: 100vw;
    height: 100vh;
    height: calc(var(--vh, 1vh) * 100);
  }
  @media (orientation: landscape) and (max-height: 480px) {
    width: 100vw;
    height: 100vh;
    height: calc(var(--vh, 1vh) * 100);
    padding-top: 0;
    justify-content: center;
  }

  animation: ${Animation.smoothAppear} 1s;
`;

const StartImg = styled.img`
  position: fixed;
  right: 2vw;
  bottom: calc(var(--vh, 1vh) * 12);

  width: 60%;
  height: 60%;
  object-fit: contain;
  @media (orientation: portrait) or (max-height: 480px) {
    width: 80%;
    height: calc(var(--vh, 1vh) * 30);
    bottom: calc(var(--vh, 1vh) * 6);
    /* margin-right: 24px; */
  }
  @media (orientation: landscape) and (max-height: 480px) {
    width: 50%;
    height: 70%;
  }
`;

const StartButton = styled.button`
  /* font-family: OAGothic-ExtraBold; */

  z-index: 99;
  font-size: 20px;
  color: white;
  color: rgba(0, 0, 0, 0.7);
  text-transform: uppercase;

  padding: 12px 24px;
  font-weight: 600;

  border-radius: 6px;

  background-color: #f4f6b1;
  /* box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.15); */
  border: 3px solid rgba(0, 0, 0, 0.1);

  cursor: pointer;
`;
