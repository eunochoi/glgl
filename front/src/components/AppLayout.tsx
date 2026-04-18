import React, { useCallback, useContext, useEffect, useState } from "react";
import Header from "./common/Header";
import styled from "styled-components/macro";

import PCSide from "./PCSide";
import IsMobile from "../functions/IsMobile";
import MobileSide from "./MobileSide";
import { PostInputModalContext } from "../context/PostInputModalContext";
import { MobileSideContext } from "../context/MobileSideContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const isMobile = IsMobile();

  const postInput = useContext(PostInputModalContext);
  const [mobileSideOpen, setMobileSideOpen] = useState<boolean>(false);

  const openMobileSide = useCallback(() => {
    history.pushState({ page: "modal" }, "", "");
    setMobileSideOpen(true);
  }, []);

  useEffect(() => {
    if (mobileSideOpen || postInput?.postInputOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [mobileSideOpen, postInput?.postInputOpen]);

  return (
    <MobileSideContext.Provider value={{ openMobileSide }}>
      {isMobile ? (
        <MobileWrapper>
          {mobileSideOpen && <MobileSide setMobileSideOpen={setMobileSideOpen} />}

          <Children>{children}</Children>
          <Header />
        </MobileWrapper>
      ) : (
        <PcWrapper>
          <LeftWrapper>
            <PCSide />
          </LeftWrapper>
          <RightWrapper>
            <Children id="scrollWrapper">{children}</Children>
          </RightWrapper>
        </PcWrapper>
      )}
    </MobileSideContext.Provider>
  );
};

export default AppLayout;

const Children = styled.div`
  min-height: 100vh;

  height: auto;

  display: flex;
  flex-direction: column;
  align-items: center;

  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera*/
  }
  @media (orientation: landscape) and (max-height: 480px) {
    padding-left: 20vw;
  }
`;

const MobileWrapper = styled.div`
  background-color: #c8daf3;
  background-color: white;

  height: auto;

  .scroll {
    overflow: hidden;
  }
`;
const PcWrapper = styled.div`
  display: flex;
`;

const LeftWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;

  width: 280px;
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);

  z-index: 4000;
  z-index: 1000;
  z-index: 500;
`;
const RightWrapper = styled.div`
  margin-left: 280px;
  width: calc(100vw - 280px);

  flex-grow: 1;
  -webkit-box-flex: 1;
`;
