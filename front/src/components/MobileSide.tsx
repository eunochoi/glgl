import React, { useEffect, useState } from "react";
import User from "../functions/reactQuery/User";
import { useNavigate, useLocation } from "react-router-dom";
import { navBoardIndexFromPath, PATH_HOME, PATH_TIP, PATH_FREE, PATH_GALLERY, profilePath } from "../routes/boardPaths";

import useAlert from "./common/Alert";
import SideBar from "../styles/SidaBar";
import { createPortal } from "react-dom";

//zustanc
import { useModalStack } from "../store/modalStack";

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
import { useBrowserCheck } from "../store/borowserCheck";

interface Props {
  setMobileSideOpen: (b: boolean) => void;
}

const MobileSide = ({ setMobileSideOpen }: Props) => {
  const navigate = useNavigate();

  const { push, pop, modalStack } = useModalStack();
  const { browser } = useBrowserCheck();

  const user = User.get().data;
  const logout = User.logout();

  const [sideBarAnimation, setAnimation] = useState<"open" | "close" | "">("");
  // const [timer, setTimer] = useState<NodeJS.Timeout>();

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

  const onClose = () => {
    setAnimation("close");
  };

  const ButtonClose = () => {
    setAnimation("close");
    // setTimer(
    //   setTimeout(() => {
    //     history.back();
    //   }, 300)
    // );
  };

  useEffect(() => {
    if (modalStack[modalStack.length - 1] === "#sidebar") {
      window.onpopstate = () => {
        console.log("pop: mobile side");
        onClose();

        if (browser === "Safari") setMobileSideOpen(false);
        else setAnimation("close");
      };
    }
  }, [modalStack.length]);

  useEffect(() => {
    push("#sidebar");
    setAnimation("open");
    // clearTimeout(timer);

    return () => {
      window.onpopstate = null;
      pop();
    };
  }, []);

  return (
    <>
      {createPortal(<LogoutConfirm />, document.getElementById("modal_root") as HTMLElement)}
      {createPortal(
        <>
          <SideBar.BG
            animation={sideBarAnimation}
            onClick={() => {
              ButtonClose();
            }}
            onTransitionEnd={(e) => {
              e.stopPropagation();
              if (sideBarAnimation === "close") {
                setMobileSideOpen(false);
              }
            }}
          ></SideBar.BG>
          <SideBar.MobileWrapper animation={sideBarAnimation}>
            <SideBar.HeaderWrapper>
              <button
                onClick={() => {
                  navigate(PATH_HOME);
                  onClose();
                }}
              >
                <ExtensionIcon fontSize="inherit" />
                <span>God Lock</span>
              </button>
            </SideBar.HeaderWrapper>
            {user && (
              <SideBar.UserInfoWrapper animation={sideBarAnimation}>
                <div
                  onClick={() => {
                    navigate(profilePath(0));
                    onClose();
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
                    onClose();
                  }}
                >
                  <span id="nickname">{user?.nickname?.slice(0, 8)}</span>
                  <span id="email">{user?.email}</span>
                  <span id="usertext">{user?.usertext}</span>
                </div>

                {user?.level !== 0 && (
                  <Stack
                    direction="row"
                    divider={<Divider orientation="vertical" />}
                    spacing={1}
                    justifyContent="center"
                  >
                    <button
                      className="info_box"
                      onClick={() => {
                        navigate(profilePath(0));
                        onClose();
                      }}
                    >
                      <span>{user?.Posts?.length ? makeK(user?.Posts?.length) : "-"}</span>
                      <span>Posts</span>
                    </button>
                    <button
                      className="info_box"
                      onClick={() => {
                        navigate(profilePath(4));
                        onClose();
                      }}
                    >
                      <span>{user?.Followings?.length ? makeK(user?.Followings?.length) : "-"}</span>
                      <span>Followings</span>
                    </button>
                    <button
                      className="info_box"
                      onClick={() => {
                        navigate(profilePath(5));
                        onClose();
                      }}
                    >
                      <span>{user?.Followers?.length ? makeK(user?.Followers?.length) : "-"}</span>
                      <span>Followers</span>
                    </button>
                  </Stack>
                )}
              </SideBar.UserInfoWrapper>
            )}
            <SideBar.MenuWrapper currentPage={currentPage + 1} animation={sideBarAnimation}>
              <Stack divider={<Divider orientation="horizontal" />} spacing={2} justifyContent="center">
                <div></div>
                <div id="buttons">
                  <button
                    onClick={() => {
                      navigate(PATH_HOME);
                      onClose();
                    }}
                  >
                    <HomeRoundedIcon />
                    Home
                  </button>
                  <button
                    onClick={() => {
                      navigate(PATH_TIP);
                      onClose();
                    }}
                  >
                    <LightbulbRoundedIcon />
                    Tip Board
                  </button>
                  <button
                    onClick={() => {
                      navigate(PATH_FREE);
                      onClose();
                    }}
                  >
                    <ForumIcon />
                    Free Board
                  </button>
                  <button
                    onClick={() => {
                      navigate(PATH_GALLERY);
                      onClose();
                    }}
                  >
                    <PhotoRoundedIcon />
                    Gallery
                  </button>
                  {user && user.level !== 0 && (
                    <button
                      onClick={() => {
                        navigate(profilePath(0));
                        onClose();
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
                        openLogoutConfirm({
                          mainText: "로그아웃 하시겠습니까?",
                          onSuccess: () => {
                            logout.mutate();
                          }
                        });
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
                        onClose();
                      }}
                    >
                      <LoginIcon />
                      로그인
                    </button>
                  )}
                </div>
              </Stack>
            </SideBar.MenuWrapper>
          </SideBar.MobileWrapper>
        </>,
        document.getElementById("front_component_root") as HTMLElement
      )}
    </>
  );
};

export default React.memo(MobileSide);
