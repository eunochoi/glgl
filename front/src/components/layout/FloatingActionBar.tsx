import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import MenuIcon from "@mui/icons-material/Menu";
import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components/macro";
import { MobileSideContext } from "../../context/MobileSideContext";
import IsMobile from "../../functions/IsMobile";
import Animation from "../../styles/Animation";
import Bot from "../chatbot/Bot";

interface FloatingActionBarProps {
  children?: React.ReactNode;
}

const GOTOP_BUTTON_VISIBLE_HEIGHT = 720;

/** 우측 하단 고정: 맨 위로 → (페이지별 children) → 챗봇 → 메뉴(모바일) */
const FloatingActionBar = ({ children }: FloatingActionBarProps) => {
  const isMobile = IsMobile();
  const mobileSide = useContext(MobileSideContext);
  const [goTopButton, setGoTopButton] = useState(false);

  const scrollTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      setGoTopButton(window.scrollY > GOTOP_BUTTON_VISIBLE_HEIGHT);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <ButtonWrapper>
      {goTopButton && (
        <button id="mobileTop" type="button" onClick={scrollTop}>
          <ArrowUpwardIcon fontSize="medium" />
        </button>
      )}
      {children}
      <BotWrapper>
        <Bot />
      </BotWrapper>
      {isMobile && mobileSide && (
        <button
          id="menuButton"
          type="button"
          onClick={() => {
            mobileSide.openMobileSide();
          }}
        >
          <MenuIcon fontSize="medium" />
        </button>
      )}
    </ButtonWrapper>
  );
};

export default FloatingActionBar;

const BotWrapper = styled.div`
  .rsc-header-close-button {
    display: none !important;
  }
  .rsc-float-button {
    position: static;

    animation: ${Animation.smoothAppear} 0.3s ease-in-out;

    width: 48px;
    height: 48px;
    margin-top: 6px;

    background-color: #f3e0f1 !important;

    transition: 0.3s ease-in-out all;

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        background-color: #c7d7ff !important;
      }
    }

    box-shadow: 0px 0px 0px rgba(0, 0, 0, 0);
    border: solid 2px rgba(0, 0, 0, 0.05);
  }
  .rsc-container {
    @media (orientation: landscape) and (max-height: 480px) {
      height: 320px;
    }
    @media (orientation: portrait) and (max-width: 480px) {
      top: 0 !important;
      bottom: auto;
    }
  }
  .rsc-content {
    @media (orientation: landscape) and (max-height: 480px) {
      height: calc(320px - 56px - 56px);
    }
  }
  * {
    z-index: 1000;
    font-weight: 600 !important;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: end;

  z-index: 999;
  position: fixed;
  bottom: 32px;
  right: 32px;

  @media (orientation: portrait) {
    right: 18px;
    bottom: 24px;
  }

  #menuButton {
    @media (orientation: landscape) and (max-height: 480px) {
      display: none;
    }
  }
  > button {
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
  }
`;
