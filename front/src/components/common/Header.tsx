import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { createPortal } from "react-dom";

import User from "../../functions/reactQuery/User";
import useAlert from "./Alert";
import IsLandscape from "../../functions/IsLandscape";

//mui
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import LightbulbRoundedIcon from "@mui/icons-material/LightbulbRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import PhotoRoundedIcon from "@mui/icons-material/PhotoRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ExtensionIcon from "@mui/icons-material/Extension";
import ForumIcon from "@mui/icons-material/Forum";

import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";

//mobile header
const Header = () => {
  const isLandscape = IsLandscape();

  const user = User.get().data;
  const logout = User.logout();

  const { type } = useParams();
  let currentPage = type ? parseInt(type) : -1;
  const navigate = useNavigate();

  const { Alert: LogoutConfirm, openAlert: openLogoutConfirm } = useAlert();

  if (window.location.pathname.split("/")[1] === "profile") currentPage = 4;

  return (
    <>
      {createPortal(<LogoutConfirm />, document.getElementById("modal_root") as HTMLElement)}
      {isLandscape && (
        <LandMobileHeaderWrapper>
          <HeaderLogo
            onClick={() => {
              window.scrollTo({
                top: 0,
                left: 0,
                behavior: "smooth"
              });
            }}
          >
            <ExtensionIcon fontSize="inherit" />
            <span onClick={() => navigate("/main/0")}>God Lock</span>
          </HeaderLogo>
          <HeaderMenu>
            <LoginMenu currentPage={currentPage + 1}>
              <button onClick={() => navigate("/main/0")}>
                <HomeRoundedIcon />
                <span>Home</span>
              </button>
              <button onClick={() => navigate("/main/1")}>
                <LightbulbRoundedIcon />
                <span>Tip Post</span>
              </button>
              <button onClick={() => navigate("/main/2")}>
                <PeopleRoundedIcon />
                <span>Free Board</span>
              </button>
              <button onClick={() => navigate("/main/3")}>
                <PhotoRoundedIcon />
                <span>Gallery</span>
              </button>

              {user && user.level !== 0 && (
                <button onClick={() => navigate("/main/4/cat/0")}>
                  <PersonRoundedIcon />
                  <span>Profile</span>
                </button>
              )}

              <Bar />

              {user ? (
                <button
                  onClick={() => {
                    openLogoutConfirm({
                      mainText: "로그아웃 하시겠습니까?",
                      onSuccess: () => {
                        logout.mutate();
                      }
                    });
                  }}
                >
                  <ExitToAppRoundedIcon />
                  <span>Logout</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigate("/login");
                  }}
                >
                  <span>로그인</span>
                </button>
              )}
            </LoginMenu>
          </HeaderMenu>
        </LandMobileHeaderWrapper>
      )}
      {!isLandscape && (
        <PortMobileHeaderWrapper>
          <HeaderLogo
            onClick={() => {
              window.scrollTo({
                top: 0,
                left: 0,
                behavior: "smooth"
              });
            }}
          >
            <ExtensionIcon fontSize="inherit" />
            <span onClick={() => navigate("/main/0")}>God Lock</span>
          </HeaderLogo>

          <HeaderLocation>
            {currentPage === 0 && <HomeRoundedIcon fontSize="inherit" />}
            {currentPage === 1 && <LightbulbRoundedIcon fontSize="inherit" />}
            {currentPage === 2 && <ForumIcon fontSize="inherit" />}
            {currentPage === 3 && <PhotoRoundedIcon fontSize="inherit" />}
            {currentPage === 4 && <PersonRoundedIcon fontSize="inherit" />}
          </HeaderLocation>
        </PortMobileHeaderWrapper>
      )}
    </>
  );
};

export default Header;

const Bar = styled.span`
  height: 1px;
  width: 100%;
  background-color: rgba(99, 107, 116, 0.21);
  margin: 12px 0;
`;

const LandMobileHeaderWrapper = styled.div`
  position: fixed;
  z-index: 980;
  top: 0px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  background-color: whitesmoke;
  border-right: 2px solid rgba(0, 0, 0, 0.05);
  width: 20vw;
  height: 100vh;
`;
const HeaderMenu = styled.div`
  flex-direction: column;
  justify-content: center;
  align-items: start;

  margin-top: 16px;
`;
const LoginMenu = styled.div<{ currentPage: number | undefined }>`
  display: flex;
  justify-content: center;
  align-items: start;
  flex-direction: column;

  width: auto;
  height: 70vh;

  button {
    display: flex;
    justify-content: center;
    align-items: center;

    color: rgba(0, 0, 0, 0.6);
    margin: 8px 0;

    span {
      font-size: 18px;
      font-weight: 600;
      padding-left: 8px;
    }
  }

  button:nth-child(${(props) => props.currentPage}) {
    color: #d5a8d0;
  }
`;
const PortMobileHeaderWrapper = styled.div`
  position: fixed;
  z-index: 980;
  top: 0px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  height: 48px;
  width: 100vw;
  padding: 0 4vw;

  background-color: #fff;
`;

const HeaderLocation = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  color: #d5a8d0;
  color: rgba(0, 0, 0, 0.4);
  font-size: 22px;
  font-weight: 600;
`;
const HeaderLogo = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  color: #d5a8d0;
  font-size: 20px;
  span {
    margin-left: 4px;
    font-family: OAGothic-ExtraBold;
    color: rgba(0, 0, 0, 0.6);

    font-size: 20px;
    font-weight: 600;
  }
`;
