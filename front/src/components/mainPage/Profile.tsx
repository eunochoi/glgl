import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components/macro";
import Axios from "../../apis/Axios";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import InfiniteScroll from "react-infinite-scroll-component";

import moment from "moment";
import "moment/locale/ko";

//components
import ProfileChangePopup from "../common/ProfileChangePopup";
import Img from "../common/Img";
import useAlert from "../common/Alert";

//style
import Animation from "../../styles/Animation";

//mui
import { Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import Badge from "@mui/material/Badge";
import InsertEmoticonRoundedIcon from "@mui/icons-material/InsertEmoticonRounded";
import InsertEmoticonOutlinedIcon from "@mui/icons-material/InsertEmoticonOutlined";
import RemoveCircleOutlinedIcon from "@mui/icons-material/RemoveCircleOutlined";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import CancelIcon from "@mui/icons-material/Cancel";
import User from "../../functions/reactQuery/User";
import UserDeleteConfirm from "../UserDeleteConfirm";
import PasswordChangeConfirm from "../PasswordChangeConfirm";
import CircularProgress from "@mui/material/CircularProgress";
import IsMobile from "../../functions/IsMobile";

interface userProps {
  email: string;
  id: number;
  nickname: string;
}
interface imageProps {
  src: string;
}
interface postProps {
  id: number;
  User: userProps;
  Images: imageProps[];
  content: string;
  createdAt: string;
}
interface user {
  usertext: string;
  nickname: string;
  id: number;
  profilePic: string;
}

const Profile = () => {
  moment.locale("ko");
  const isMobile = IsMobile();
  const navigate = useNavigate();

  //alert
  const { Alert: UsertextUpdateConfirm, openAlert: openUsertextUpdateConfirm } = useAlert();
  const { Alert: NicknameUpdateConfirm, openAlert: openNicknameUpdateConfirm } = useAlert();
  const { Alert: UnFollowConfirm, openAlert: openUnFollowConfirm } = useAlert();
  const { Alert: DeleteFollowerConfirm, openAlert: openDeleteFollowerConfirm } = useAlert();
  const { Alert: LogoutConfirm, openAlert: openLogoutConfirm } = useAlert();

  //state
  const [nicknameInputToggle, setNicknameInputToggle] = useState<boolean>(false);
  const [usertextInputToggle, setUsertextInputToggle] = useState<boolean>(false);
  const [userDeleteModal, setUserDeleteModal] = useState<boolean>(false);
  const [imageChangeModal, setImageChangeModal] = useState<boolean>(false);
  const [passwordChangeModal, setPasswordChangeModal] = useState<boolean>(false);

  const params = useParams();
  const categoryNum = params.cat ? parseInt(params.cat) : -1;

  //useQuery
  const user = User.get().data;

  //input state
  const [nickname, setNickname] = useState<string>(user?.nickname);
  const [usertext, setUsertext] = useState<string>(user?.usertext);

  const scrollTarget = useRef<HTMLDivElement>(null);
  const category = ["Tip Posts", "Free Posts", "Bookmark", "Like", "Followings", "Followers"];

  //function
  const scrollToPill = () => {
    window.scrollTo({
      top: scrollTarget.current?.scrollHeight,
      left: 0,
      behavior: "smooth"
    });
  };
  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  };
  const nickUpdateConfirm = (nickname: string) => {
    const pattern = /^(?=.*[a-z0-9가-힣])[a-z0-9가-힣]{2,8}$/;
    nickname = nickname?.toLowerCase();
    // console.log(nickname);
    if (!nickname.match(pattern)) {
      toast.warning("2자 이상 8자 이하, 소문자 또는 숫자 또는 한글로 구성되어야 합니다.");
    } else if (nickname === user.nickname) {
      // toast.warning("변경 내역이 없습니다.");
      setNicknameInputToggle(false);
    } else {
      openNicknameUpdateConfirm({
        mainText: "닉네임을 변경하시겠습니까?",
        onSuccess: () => {
          editNickname.mutate(
            { nickname },
            {
              onSuccess: () => {
                setNicknameInputToggle(false);
              }
            }
          );
        }
      });
    }
  };
  const usertestUpdateConfirm = () => {
    if (usertext?.length > 30) {
      toast.warning("상태메세지는 최대 30자까지 가능합니다.");
    } else {
      openUsertextUpdateConfirm({
        mainText: "상태메세지를 변경하시겠습니까?",
        onSuccess: () => {
          editUsertext.mutate(
            { usertext },
            {
              onSuccess: () => {
                setUsertextInputToggle(false);
              }
            }
          );
        }
      });
    }
  };

  const unFollowConfirm = (userId: number) => {
    openUnFollowConfirm({
      mainText: "언팔로우 하시겠습니까?",
      onSuccess: () => {
        unFollow.mutate({ userId });
      }
    });
  };
  const followerDeleteConfirm = (userId: number) => {
    openDeleteFollowerConfirm({
      mainText: "팔로워를 삭제하시겠습니까?",
      onSuccess: () => {
        deleteFollower.mutate({ userId });
      }
    });
  };

  //useInfiniteQuery
  const myInfoPosts = useInfiniteQuery(
    ["myInfoPosts"],
    ({ pageParam = 1 }) =>
      Axios.get("post/my", { params: { type: 1, pageParam, tempDataNum: 12 } }).then((res) => res.data),
    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === 0 ? undefined : allPages.length + 1;
      }
    }
  );
  const myCommPosts = useInfiniteQuery(
    ["myCommPosts"],
    ({ pageParam = 1 }) =>
      Axios.get("post/my", { params: { type: 2, pageParam, tempDataNum: 12 } }).then((res) => res.data),
    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === 0 ? undefined : allPages.length + 1;
      }
    }
  );
  const bookmarkPosts = useInfiniteQuery(
    ["bookmarkPosts"],
    ({ pageParam = 1 }) =>
      Axios.get("post/liked", { params: { type: 1, pageParam, tempDataNum: 12 } }).then((res) => res.data),
    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === 0 ? undefined : allPages.length + 1;
      }
    }
  );
  const likePosts = useInfiniteQuery(
    ["likePosts"],
    ({ pageParam = 1 }) =>
      Axios.get("post/liked", { params: { type: 2, pageParam, tempDataNum: 12 } }).then((res) => res.data),
    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === 0 ? undefined : allPages.length + 1;
      }
    }
  );

  //useMutation
  const logout = User.logout();
  const editNickname = User.editNick();
  const editUsertext = User.editText();
  const unFollow = User.unFollow();
  const deleteFollower = User.deleteFollower();

  useEffect(() => {
    const menuWrapper = document.getElementById("menuWrapper");
    const width = menuWrapper?.scrollWidth;
    if (width) {
      menuWrapper?.scrollTo({ top: 0, left: (width / 6) * categoryNum - 70, behavior: "smooth" });
    }
    setUsertextInputToggle(false);
    setNicknameInputToggle(false);
  }, [categoryNum]);

  //프로필 이미지 변경 팝업 뜬 경우 배경 스크롤 방지
  useEffect(() => {
    if (imageChangeModal) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [imageChangeModal]);

  useEffect(() => {
    if (user.level === 0) {
      history.back();
    }
  }, [user.level]);

  useEffect(() => {
    if (categoryNum >= 0 && categoryNum <= 6) {
      console.log("올바른 catagory");
    } else {
      navigate("/404");
    }
    const height = scrollTarget.current?.scrollHeight;
    console.log(height, window.scrollY);

    if (height && height < window?.scrollY) {
      scrollToPill();
    }

    return () => {
      //
    };
  }, []);

  return (
    <ProfileWrapper>
      {createPortal(
        <>
          {imageChangeModal && <ProfileChangePopup setImageChangeModal={setImageChangeModal} />}
          {userDeleteModal && <UserDeleteConfirm setUserDeleteModal={setUserDeleteModal} />}
          {passwordChangeModal && <PasswordChangeConfirm setPasswordChangeModal={setPasswordChangeModal} />}
          <UsertextUpdateConfirm />
          <NicknameUpdateConfirm />
          <UnFollowConfirm />
          <DeleteFollowerConfirm />
          <LogoutConfirm />
        </>,
        document.getElementById("modal_root") as HTMLElement
      )}

      <ProfileTitle ref={scrollTarget}>
        <div id="title">
          <Title>Profile</Title>
          {/* <span id="bar">-</span> */}
          <span id="timeinfo">마지막 수정 ⋯ {moment(user?.updatedAt).fromNow()}</span>
        </div>

        <ProfilePicWrapper>
          {user?.profilePic ? (
            <ProfilePicTitle crop={true} alt="userProfilePic" src={`${user?.profilePic}`} />
          ) : (
            <ProfilePicTitle
              crop={true}
              alt="userProfilePic"
              src={`${process.env.PUBLIC_URL}/img/defaultProfilePic.png`}
            />
          )}
          <Button
            color="inherit"
            onClick={() => {
              history.pushState({ page: "modal" }, "", "");
              setImageChangeModal((c) => !c);
            }}
          >
            <EditIcon fontSize="small" />
          </Button>
        </ProfilePicWrapper>
        <InfoAttribute height={50}>
          {nicknameInputToggle || (
            <InfoValue>
              <span id="nickname">{user?.nickname?.slice(0, 8)}</span>
              <Button
                color="inherit"
                onClick={() => {
                  setNicknameInputToggle((c) => !c);
                  setUsertextInputToggle(false);
                }}
              >
                <EditIcon fontSize="small" />
              </Button>
            </InfoValue>
          )}
          {nicknameInputToggle && (
            <InputWrapper fontsize={16}>
              <div>
                <input
                  placeholder="닉네임 입력..."
                  value={nickname || ""}
                  onChange={(e) => {
                    setNickname(e.target.value);
                  }}
                />
                <button
                  onClick={() => {
                    setNicknameInputToggle((c) => !c);
                  }}
                >
                  <CancelIcon color="error" fontSize="small" />
                </button>
                <button>
                  <CheckCircleIcon fontSize="small" onClick={() => nickUpdateConfirm(nickname)} />
                </button>
              </div>
            </InputWrapper>
          )}
        </InfoAttribute>

        <InfoAttribute height={28}>
          <InfoValue>
            <span id="email">{user?.email}</span>
          </InfoValue>
        </InfoAttribute>

        <InfoAttribute height={36}>
          {usertextInputToggle || (
            <InfoValue>
              <span id="usertext">{user?.usertext ? user?.usertext : "-"}</span>
              <Button
                color="inherit"
                onClick={() => {
                  setUsertextInputToggle((c) => !c);
                  setNicknameInputToggle(false);
                }}
              >
                <EditIcon fontSize="small" />
              </Button>
            </InfoValue>
          )}
          {usertextInputToggle && (
            <InputWrapper fontsize={16}>
              <div>
                <input
                  placeholder="상태 메세지 입력..."
                  value={usertext}
                  onChange={(e) => {
                    setUsertext(e.target.value);
                  }}
                />
                <button
                  onClick={() => {
                    setUsertextInputToggle((c) => !c);
                  }}
                >
                  <CancelIcon color="error" fontSize="small" />
                </button>
                <button onClick={() => usertestUpdateConfirm()}>
                  <CheckCircleIcon fontSize="small" />
                </button>
              </div>
            </InputWrapper>
          )}
        </InfoAttribute>

        <ButtonWrapper>
          {user?.level === 1 && (
            <button
              onClick={() => {
                history.pushState({ page: "modal" }, "", "");
                setPasswordChangeModal(true);
              }}
            >
              <span>비밀번호 변경</span>
            </button>
          )}
          <button
            onClick={() => {
              history.pushState({ page: "modal" }, "", "");
              setUserDeleteModal(true);
            }}
          >
            <span>회원 탈퇴</span>
          </button>
        </ButtonWrapper>
      </ProfileTitle>
      <MenuWrapper id="menuWrapper">
        {category.map((v, i) => (
          <Pill
            catNum={categoryNum}
            key={"catNum" + i}
            onClick={() => {
              // scrollToPill();

              setTimeout(() => {
                navigate(`/main/4/cat/${i}`);
              }, 10);
            }}
          >
            {v}
          </Pill>
        ))}
      </MenuWrapper>

      {categoryNum === 0 && (
        <ContentWrapper>
          <Posts>
            {myInfoPosts?.data?.pages[0].length === 0 && (
              <EmptyNoti>
                <SentimentVeryDissatisfiedIcon fontSize="inherit" />
                <span>포스트가 존재하지 않습니다.</span>
              </EmptyNoti>
            )}
            {myInfoPosts?.data?.pages[0].length !== 0 && (
              <InfiniteScroll
                hasMore={myInfoPosts.hasNextPage || false}
                loader={
                  <LoadingIconWrapper>
                    <CircularProgress size={96} color="inherit" />
                  </LoadingIconWrapper>
                }
                next={() => myInfoPosts.fetchNextPage()}
                dataLength={myInfoPosts.data?.pages.reduce((total, page) => total + page.length, 0) || 0}
              >
                {myInfoPosts?.data?.pages.map((p) => (
                  <Grid key={"grid" + p}>
                    {p.map((v: postProps, i: number) => {
                      if (v.Images.length >= 1) {
                        return (
                          <Img
                            onClick={() => navigate(`/postview/${v.id}`)}
                            id="imageItem"
                            key={"post" + i}
                            crop={true}
                            src={`${v.Images[0].src}`}
                            alt="img"
                          />
                        );
                      } else {
                        return (
                          <div onClick={() => navigate(`/postview/${v.id}`)} id="textItem" key={"post" + i}>
                            <span>{v.content}</span>
                          </div>
                        );
                      }
                    })}
                  </Grid>
                ))}
              </InfiniteScroll>
            )}
          </Posts>
        </ContentWrapper>
      )}
      {categoryNum === 1 && (
        <ContentWrapper>
          <Posts>
            {myCommPosts?.data?.pages[0].length === 0 && (
              <EmptyNoti>
                <SentimentVeryDissatisfiedIcon fontSize="inherit" />
                <span>포스트가 존재하지 않습니다.</span>
              </EmptyNoti>
            )}
            {myCommPosts?.data?.pages[0].length !== 0 && (
              <InfiniteScroll
                hasMore={myCommPosts.hasNextPage || false}
                loader={
                  <LoadingIconWrapper>
                    <CircularProgress size={96} color="inherit" />
                  </LoadingIconWrapper>
                }
                next={() => myCommPosts.fetchNextPage()}
                dataLength={myCommPosts.data?.pages.reduce((total, page) => total + page.length, 0) || 0}
              >
                {myCommPosts?.data?.pages.map((p) => (
                  <Grid key={"grid" + p}>
                    {p.map((v: postProps, i: number) => {
                      if (v.Images.length >= 1) {
                        return (
                          <Img
                            onClick={() => navigate(`/postview/${v.id}`)}
                            id="imageItem"
                            key={"post" + i}
                            crop={true}
                            src={`${v.Images[0].src}`}
                            alt="img"
                          />
                        );
                      } else {
                        return (
                          <div onClick={() => navigate(`/postview/${v.id}`)} id="textItem" key={"post" + i}>
                            <span>{v.content}</span>
                          </div>
                        );
                      }
                    })}
                  </Grid>
                ))}
              </InfiniteScroll>
            )}
          </Posts>
        </ContentWrapper>
      )}
      {categoryNum === 2 && (
        <ContentWrapper>
          <Posts>
            {bookmarkPosts?.data?.pages[0].length === 0 && (
              <EmptyNoti>
                <SentimentVeryDissatisfiedIcon fontSize="inherit" />
                <span>포스트가 존재하지 않습니다.</span>
              </EmptyNoti>
            )}
            {bookmarkPosts?.data?.pages[0].length !== 0 && (
              <InfiniteScroll
                hasMore={bookmarkPosts.hasNextPage || false}
                loader={
                  <LoadingIconWrapper>
                    <CircularProgress size={96} color="inherit" />
                  </LoadingIconWrapper>
                }
                next={() => bookmarkPosts.fetchNextPage()}
                dataLength={bookmarkPosts.data?.pages.reduce((total, page) => total + page.length, 0) || 0}
              >
                {bookmarkPosts?.data?.pages.map((p) => (
                  <Grid key={"grid" + p}>
                    {p.map((v: postProps, i: number) => {
                      if (v.Images.length >= 1) {
                        return (
                          <Img
                            onClick={() => navigate(`/postview/${v.id}`)}
                            id="imageItem"
                            key={"post" + i}
                            crop={true}
                            src={`${v.Images[0].src}`}
                            alt="img"
                          />
                        );
                      } else {
                        return (
                          <div onClick={() => navigate(`/postview/${v.id}`)} id="textItem" key={"post" + i}>
                            <span>{v.content}</span>
                          </div>
                        );
                      }
                    })}
                  </Grid>
                ))}
              </InfiniteScroll>
            )}
          </Posts>
        </ContentWrapper>
      )}
      {categoryNum === 3 && (
        <ContentWrapper>
          <Posts>
            {likePosts?.data?.pages[0].length === 0 && (
              <EmptyNoti>
                <SentimentVeryDissatisfiedIcon fontSize="inherit" />
                <span>포스트가 존재하지 않습니다.</span>
              </EmptyNoti>
            )}
            {likePosts?.data?.pages[0].length !== 0 && (
              <InfiniteScroll
                hasMore={likePosts.hasNextPage || false}
                loader={
                  <LoadingIconWrapper>
                    <CircularProgress size={96} color="inherit" />
                  </LoadingIconWrapper>
                }
                next={() => likePosts.fetchNextPage()}
                dataLength={likePosts.data?.pages.reduce((total, page) => total + page.length, 0) || 0}
              >
                {likePosts?.data?.pages.map((p) => (
                  <Grid key={"grid" + p}>
                    {p.map((v: postProps, i: number) => {
                      if (v.Images.length >= 1) {
                        return (
                          <Img
                            onClick={() => navigate(`/postview/${v.id}`)}
                            id="imageItem"
                            key={"post" + i}
                            crop={true}
                            src={`${v.Images[0].src}`}
                            alt="img"
                          />
                        );
                      } else {
                        return (
                          <div onClick={() => navigate(`/postview/${v.id}`)} id="textItem" key={"post" + i}>
                            <span>{v.content}</span>
                          </div>
                        );
                      }
                    })}
                  </Grid>
                ))}
              </InfiniteScroll>
            )}
          </Posts>
        </ContentWrapper>
      )}
      {categoryNum === 4 && (
        <ContentWrapper>
          <ContentBox width={500} padding={0}>
            <ListTitle>
              <Badge badgeContent={user?.Followings?.length} color="info" max={999} showZero>
                <InsertEmoticonRoundedIcon fontSize="large" />
              </Badge>
              <div>Followings</div>
            </ListTitle>

            <List>
              {user?.Followings?.length === 0 ? (
                <EmptyUserNoti>
                  <span>팔로잉 목록이 존재하지 않습니다.</span>
                </EmptyUserNoti>
              ) : (
                user?.Followings?.map((v: user, i: number) => (
                  <ListItem key={v.nickname + i}>
                    <div onClick={() => navigate(`/userinfo/${v?.id}/cat/0`)}>
                      {v.profilePic ? (
                        <ProfilePic32 crop={true} alt="ProfilePic" src={v.profilePic} />
                      ) : (
                        <ProfilePic32
                          crop={true}
                          alt="defaultProfilePic"
                          src={`${process.env.PUBLIC_URL}/img/defaultProfilePic.png`}
                        />
                      )}

                      <span>{v.nickname?.slice(0, 8)}</span>
                    </div>
                    {isMobile || <span id="usertext">{v.usertext}</span>}

                    <Button onClick={() => unFollowConfirm(v.id)}>
                      <PersonRemoveIcon color="error" />
                    </Button>
                  </ListItem>
                ))
              )}
            </List>
          </ContentBox>
        </ContentWrapper>
      )}
      {categoryNum === 5 && (
        <ContentWrapper>
          <ContentBox width={500} padding={0}>
            <ListTitle>
              <Badge badgeContent={user?.Followers?.length} color="info" max={999} showZero>
                <InsertEmoticonOutlinedIcon fontSize="large" />
              </Badge>
              <div>Followers</div>
            </ListTitle>

            <List>
              {user?.Followers?.length === 0 ? (
                <EmptyUserNoti>
                  <span>팔로워 목록이 존재하지 않습니다.</span>
                </EmptyUserNoti>
              ) : (
                user?.Followers?.map((v: user, i: number) => (
                  <ListItem key={v.nickname + i}>
                    <div onClick={() => navigate(`/userinfo/${v?.id}/cat/0`)}>
                      {v.profilePic ? (
                        <ProfilePic32 crop={true} alt="ProfilePic" src={v.profilePic} />
                      ) : (
                        <ProfilePic32
                          crop={true}
                          alt="ProfilePic"
                          src={`${process.env.PUBLIC_URL}/img/defaultProfilePic.png`}
                        />
                      )}
                      <span>{v?.nickname?.slice(0, 8)}</span>
                    </div>
                    {isMobile || <span id="usertext">{v?.usertext}</span>}

                    <Button onClick={() => followerDeleteConfirm(v?.id)}>
                      <RemoveCircleOutlinedIcon color="error" />
                    </Button>
                  </ListItem>
                ))
              )}
            </List>
          </ContentBox>
        </ContentWrapper>
      )}
    </ProfileWrapper>
  );
};

export default Profile;
const InputWrapper = styled.div<{ fontsize: number }>`
  display: flex;
  justify-content: start;
  align-items: center;
  width: 70%;
  @media (orientation: portrait) {
    width: 100%;
  }
  height: 100%;

  > div {
    display: flex;
    justify-content: start;
    align-items: center;
    border: 2px rgba(0, 0, 0, 0.4) solid;
    border-radius: 8px;

    padding-left: 8px;

    height: 32px;
    width: 100%;
    /* margin: 6px 0; */
    button {
      display: flex;
      justify-content: center;
      align-items: center;

      width: 32px;
      height: 32px;
    }
    input {
      border: none;
      outline-style: none;
      height: 100%;
      width: calc(100% - 64px);
      color: rgba(0, 0, 0, 0.7);
      font-size: ${(props) => props.fontsize + "px"};
      /* font-size: 18px; */
      /* background-color: rgba(0, 0, 0, 0); */
    }
  }
`;
const Userstatus = styled.span`
  font-size: 20px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  margin-top: 24px;
`;
const Grid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: stretch;

  row-gap: 8px;
  column-gap: 8px;
  margin-bottom: 8px;

  #imageItem {
    width: 100%;
    aspect-ratio: 1 / 1;

    border: 2px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }
  #textItem {
    background-color: #fafafa;
    width: 100;
    aspect-ratio: 1 / 1;

    border: 2px solid rgba(0, 0, 0, 0.05);
    border-radius: 8px;

    display: flex;
    justify-content: center;
    align-items: center;

    overflow: hidden;
    > span {
      width: 80% !important;
      overflow: hidden !important;
      height: auto;

      line-height: 1.3em;
      font-size: 18px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.65);

      white-space: pre-wrap;
      overflow-wrap: break-word;
      text-overflow: ellipsis;

      display: -webkit-box;
      -webkit-line-clamp: 5 !important;
      -webkit-box-orient: vertical;
    }
  }
  @media (orientation: portrait) {
    grid-template-columns: 1fr 1fr;
    /* row-gap: 4px;
    column-gap: 4px; */
    margin-bottom: 4px;
    #textItem > span {
      font-size: 16px;
      -webkit-line-clamp: 4 !important; /* 원하는 줄 수 표시 */
    }
  }
`;
const ProfileWrapper = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  animation: ${Animation.smoothAppear} 0.5s ease-in-out;
`;
const LoadingIconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: #f3e0f1;
  margin: 32px 0;
`;

const Pill = styled.button<{ catNum: number }>`
  transition: all ease-in-out 0.5s;
  height: 32px;
  margin-right: 12px;
  padding: 6px 20px;
  border-radius: 100px;
  border: solid 2px rgba(0, 0, 0, 0.05);

  font-weight: 500;
  font-size: 18px;

  cursor: pointer;

  display: flex;
  align-items: center;

  color: #464b53;
  background-color: #e3ecf9;
  &:nth-child(${(props) => props.catNum + 1}) {
    background-color: #f3e0f1;
  }

  @media (orientation: portrait) or (max-height: 480px) {
    margin-right: 8px;
    &:first-child {
      margin-left: 4vw;
    }
    &:last-child {
      margin-right: 4vw;
    }
  }
  @media (orientation: landscape) and (max-height: 480px) {
    &:first-child {
      margin-left: 4px;
    }
    &:last-child {
      margin-right: 4px;
    }
  }
`;
const ProfileTitle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  width: 500px;
  width: 70%;

  margin-top: 0px;
  padding-top: 64px;
  #title {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  #bar {
    margin: 0 12px;
    color: rgba(0, 0, 0, 0.4);
    @media (orientation: portrait) {
      margin: 0 6px;
    }
  }
  #timeinfo {
    font-size: 18px;
    width: 100%;

    text-align: start;
    text-align: end;

    white-space: nowrap;
    color: rgba(0, 0, 0, 0.4);
    @media (orientation: portrait) {
      font-size: 14px;
    }
  }

  @media (orientation: portrait) or (max-height: 480px) {
    margin-top: 48px; //header
    width: 100vw;
    > * {
      padding-left: 5vw;
      padding-right: 5vw;
    }
  }
  @media (orientation: landscape) and (max-height: 480px) {
    padding-top: 32px;
    margin-top: 0;
    width: 80%;
    > * {
      padding-left: 0;
      padding-right: 0;
    }
  }
`;
const Title = styled.span`
  font-weight: 600;
  font-weight: 700;
  font-size: 44px;
  text-transform: uppercase;
  /* line-height: 36px; */

  color: rgba(0, 0, 0, 0.7);

  @media (orientation: portrait) or (max-height: 480px) {
    /* padding-left: 5vw; */
  }
  @media (orientation: landscape) and (max-height: 480px) {
    padding-left: 0;
  }
`;
const MenuWrapper = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  height: auto;
  width: 500px;
  width: 70%;

  position: sticky;
  top: 0px;

  padding: 24px 0;

  /* margin-bottom: 12px; */
  z-index: 85;
  /* background: rgb(255, 255, 255);
  background: linear-gradient(0deg, rgba(255, 255, 255, 0) 0%, rgba(245, 245, 245, 1) 11%, rgba(245, 245, 245, 1) 100%); */
  background-color: #fff;

  overflow-x: scroll;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera*/
  }
  @media (orientation: portrait) or (max-height: 480px) {
    top: 48px;
    top: 46px;
    width: 100vw;
    padding: 20px 0;
    /* background: rgb(255, 255, 255);
    background: linear-gradient(
      0deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(200, 218, 243, 1) 11%,
      rgba(200, 218, 243, 1) 100%
    ); */
  }
  @media (orientation: landscape) and (max-height: 480px) {
    width: 400px;
    width: 80%;
    top: 0px;
    padding: 18px 0;
  }
`;
const ContentWrapper = styled.div`
  animation: ${Animation.smoothAppear} 1s ease-in-out;

  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;

  width: 100%;
  //header : 48px
  //pill wrapper : 48+32
  min-height: calc(100vh - 80px);

  @media (orientation: portrait) or (max-height: 480px) {
    //haeder height : 48px
    //pill wrapper : 68px + 16
    min-height: calc(100vh - 48px - 68px - 16px);
  }
  @media (orientation: landscape) and (max-height: 480px) {
    /* width: 60vw; */
    width: 100%;
  }
`;
const ContentBox = styled.div<{ width?: number; padding?: number }>`
  width: ${(props) => props.width + "px"};
  width: 70%;
  border-radius: 6px;
  min-height: calc(100vh - 104px - 24px);
  padding: 40px ${(props) => props.padding + "px"};

  /* box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2); */
  background-color: rgba(0, 0, 0, 0.02);
  background-color: #fafafa;
  border: 2px rgba(0, 0, 0, 0.07) solid;

  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;

  * {
    flex-shrink: 0;
  }
  button {
    color: #aaa7d4;
  }
  @media (orientation: portrait) or (max-height: 480px) {
    transition: all ease-in-out 0.3s;
    width: 92vw;
    padding: 40px ${(props) => props.padding + "px"};
    //header : 48px
    //pill wrapper : 104px
    min-height: calc(var(--vh, 1vh) * 100 - 48px - 104px - 24px);
  }
  @media (orientation: landscape) and (max-height: 480px) {
    width: 400px;
    width: 80%;
    min-height: 400px;
    margin-bottom: 32px;
  }
`;

const EmptyNoti = styled.div`
  width: 100%;
  height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  font-size: 72px;
  color: rgba(0, 0, 0, 0.5);
  /* font-weight: 600; */
  span {
    margin-top: 20px;
    font-size: 18px;
    font-weight: 600;
  }
`;
const EmptyUserNoti = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  font-size: 48px;
  color: rgba(0, 0, 0, 0.5);
  /* font-weight: 600; */
  span {
    margin-top: 20px;
    font-size: 18px;
  }
`;

const ListTitle = styled.div`
  font-size: 60px;
  color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  > div {
    margin-top: 5px;
    font-size: 20px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.7);
  }
  @media (orientation: portrait) or (max-height: 480px) {
    font-size: 40px;
    > div {
      font-size: 18px;
    }
  }
`;
const ButtonWrapper = styled.div`
  margin-top: 36px;
  button {
    cursor: pointer;
    text-transform: uppercase;
    font-size: 14px;
    height: 36px;
    width: 96px;
    border: 2px solid rgba(0, 0, 0, 0.5);
    border-radius: 6px;
    margin-bottom: 12px;
    color: rgba(0, 0, 0, 0.6);
    transition: all 0.3s;
    margin-right: 6px;
    span {
      font-weight: 600;
    }
  }
`;
const List = styled.div`
  padding: 20px 0;
  width: 80%;
  height: 50%;

  flex-grow: 1;
  -webkit-box-flex: 1;

  overflow-y: scroll;
`;
const ListItem = styled.div`
  width: 100%;
  padding: 5px 5px;
  font-size: 18px;
  color: rgba(0, 0, 0, 0.7);

  display: flex;
  justify-content: space-between;
  align-items: center;

  #usertext {
    max-width: 50%;
    white-space: nowrap;
    overflow-x: scroll;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  > div {
    display: flex;
    justify-content: center;
    align-items: center;
    > span {
      margin-left: 10px;
      font-weight: 500;
    }
  }
  > button {
    min-width: 0;
  }
`;

const ProfilePic32 = styled(Img)`
  width: 32px;
  height: 32px;
  border-radius: 100%;

  background-color: #fff;

  border: 2px solid rgba(0, 0, 0, 0.15);
`;
const ProfilePicTitle = styled(Img)`
  /* position: absolute;
  right: 0px; */
  background-color: white;
  width: 140px;
  height: 140px;
  border-radius: 12px;
  /* box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.2); */
  border: 3px solid rgba(0, 0, 0, 0.1);

  /* @media (orientation: portrait) or (max-height: 480px) {
    width: 200px;
    height: 200px;
  } */
`;

const InfoAttribute = styled.div<{ height: number }>`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  height: ${(props) => props.height + "px"};

  button {
    color: #a9a7d4;
  }
`;

const InfoValue = styled.div`
  display: -webkit-box;
  display: flex;
  align-items: center;
  width: auto;
  max-width: 100%;

  input {
    width: 50%;
    flex-grow: 1;
    -webkit-box-flex: 1;

    border: none;
    outline-style: none;
    font-size: 18px;
    background-color: rgba(0, 0, 0, 0);
  }
  input::placeholder {
    font-size: 16px;
  }
  > div {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    border: 2px solid #aaa7d4;
    border-radius: 32px;
    padding: 0 10px;
    padding-right: 0;
    > button {
      min-width: 0;
      border-radius: 100px;
      padding: 6px;
      &:last-child {
        padding-left: 0px;
      }
    }
  }
  > span {
    color: rgba(0, 0, 0, 0.6);

    display: flex;
    justify-content: start;
    align-items: center;

    width: 100%;

    font-size: 18px;
    white-space: nowrap;
    overflow: auto;

    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
    &::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera*/
    }
  }
  #nickname {
    font-size: 32px;
    line-height: 44px;
    font-weight: 600;
    /* text-transform: uppercase; */
    color: rgba(0, 0, 0, 0.7);
  }
  #email {
    font-size: 16px;
    line-height: 24px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.4);
  }
  #usertext {
    width: 100%;
    overflow: scroll;
    font-size: 18px;
    line-height: 26px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.6);
  }
`;

const Posts = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;

  padding-top: 4px;

  width: 70%;
  height: auto;

  .infinite-scroll-component__outerdiv {
    width: 100%;
  }

  * {
    flex-shrink: 0;
  }
  @media (orientation: portrait) or (max-height: 480px) {
    width: 92vw;
  }
  @media (orientation: landscape) and (max-height: 480px) {
    width: 80%;
  }
`;
const ProfilePicWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: end;

  padding-top: 32px;
  margin-bottom: 8px;

  button {
    color: #a9a7d4;
  }
  overflow: auto;
  * {
    flex-shrink: 0;
  }
`;
