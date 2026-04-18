import React from "react";
import User from "../functions/reactQuery/User";
import { useNavigate, useLocation } from "react-router-dom";
import { navBoardIndexFromPath, PATH_HOME, PATH_TIP, PATH_FREE, PATH_GALLERY, profilePath } from "../routes/boardPaths";
import SideBar from "../styles/SidaBar";
import useAlert from "./common/Alert";

//mui
import Stack from "@mui/joy/Stack";
import Divider from "@mui/joy/Divider";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import LightbulbRoundedIcon from "@mui/icons-material/LightbulbRounded";
import PhotoRoundedIcon from "@mui/icons-material/PhotoRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";
import LoginIcon from "@mui/icons-material/Login";
import ExtensionIcon from "@mui/icons-material/Extension";
import ForumIcon from "@mui/icons-material/Forum";
import { createPortal } from "react-dom";

const Side = () => {
  const user = User.get().data;
  const navigate = useNavigate();
  const logout = User.logout();

  const location = useLocation();
  const currentPage = navBoardIndexFromPath(location.pathname);

  const { Alert: LogoutConfirm, openAlert: openLogoutConfirm } = useAlert();

  const makeK = (n: number | null) => {
    if (n === null) {
      return "-";
    }
    if (n > 1000) {
      return (n / 1000).toFixed(1) + "k";
    }
    return n;
  };

  const logoutConfirm = () => {
    openLogoutConfirm({
      mainText: "로그아웃 하시겠습니까?",
      onSuccess: () => {
        logout.mutate();
      }
    });
  };

  return (
    <SideBar.PCWrapper>
      {createPortal(<LogoutConfirm />, document.getElementById("modal_root") as HTMLElement)}

      <SideBar.HeaderWrapper>
        <button
          onClick={() => {
            navigate(PATH_HOME);
          }}
        >
          <ExtensionIcon fontSize="inherit" />
          <span>God Lock</span>
        </button>
      </SideBar.HeaderWrapper>
      {user && (
        <SideBar.UserInfoWrapper>
          <div
            onClick={() => {
              navigate(profilePath(0));
            }}
          >
            {user.profilePic ? (
              <SideBar.ProfilePic crop={true} src={user.profilePic} alt="profilePic" />
            ) : (
              <SideBar.ProfilePic crop={true} src="/img/defaultProfilePic.png" alt="profilePic" />
            )}
          </div>

          <div
            id="info_text_box"
            onClick={() => {
              navigate(profilePath(0));
            }}
          >
            <span id="nickname">{user?.nickname?.slice(0, 8)}</span>
            <span id="email">{user?.email}</span>
            <span id="usertext">{user?.usertext}</span>
          </div>

          {user?.level !== 0 && (
            <Stack direction="row" divider={<Divider orientation="vertical" />} spacing={1} justifyContent="center">
              <button
                className="info_box"
                onClick={() => {
                  navigate(profilePath(0));
                }}
              >
                <span>{user?.Posts?.length ? makeK(user?.Posts?.length) : "-"}</span>
                <span>Posts</span>
              </button>
              <button
                className="info_box"
                onClick={() => {
                  navigate(profilePath(4));
                }}
              >
                <span>{user?.Followings?.length ? makeK(user?.Followings?.length) : "-"}</span>
                <span>Followings</span>
              </button>
              <button
                className="info_box"
                onClick={() => {
                  navigate(profilePath(5));
                }}
              >
                <span>{user?.Followers?.length ? makeK(user?.Followers?.length) : "-"}</span>
                <span>Followers</span>
              </button>
            </Stack>
          )}
        </SideBar.UserInfoWrapper>
      )}
      <SideBar.MenuWrapper currentPage={currentPage + 1}>
        <Stack divider={<Divider orientation="horizontal" />} spacing={2} justifyContent="center">
          <div></div>
          <div id="buttons">
            <button
              onClick={() => {
                navigate(PATH_HOME);
              }}
            >
              <HomeRoundedIcon />
              Home
            </button>
            <button
              onClick={() => {
                navigate(PATH_TIP);
              }}
            >
              <LightbulbRoundedIcon />
              Tip Board
            </button>
            <button
              onClick={() => {
                navigate(PATH_FREE);
              }}
            >
              <ForumIcon />
              Free Board
            </button>
            <button
              onClick={() => {
                navigate(PATH_GALLERY);
              }}
            >
              <PhotoRoundedIcon />
              Gallery
            </button>
            {user && user.level !== 0 && (
              <button
                onClick={() => {
                  navigate(profilePath(0));
                }}
              >
                <PersonRoundedIcon />
                Profile
              </button>
            )}
          </div>
          <div id="buttons">
            {user ? (
              <button
                id="logout"
                onClick={() => {
                  logoutConfirm();
                }}
              >
                <ExitToAppRoundedIcon />
                Logout
              </button>
            ) : (
              <button
                id="logout"
                onClick={() => {
                  navigate("/login");
                }}
              >
                <LoginIcon />
                로그인
              </button>
            )}
          </div>
        </Stack>
      </SideBar.MenuWrapper>
    </SideBar.PCWrapper>
  );
};

export default Side;
