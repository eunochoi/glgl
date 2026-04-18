import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useNavigate } from "react-router-dom";

import { PostInputModalContext } from "../context/PostInputModalContext";

//components
import AppLayout from "../components/AppLayout";
import Home from "../components/mainPage/Home";
import Tips from "../components/mainPage/Tips";
import FreeBoard from "../components/mainPage/FreeBoard";
import Gallery from "../components/mainPage/Gallery";
import Profile from "../components/mainPage/Profile";
import User from "../functions/reactQuery/User";
import Loading from "./Loading";
import styled from "styled-components/macro";

const Main = () => {
  const params = useParams();
  const type = params.type ? parseInt(params.type) : 0;
  const [toggle, setToggle] = useState<number>(0);
  const navigate = useNavigate();

  const { data: user, isLoading: userLoading, isError: userError } = User.get();

  const [postInputOpen, setPostInputOpen] = useState(false);

  useEffect(() => {
    setPostInputOpen(false);
  }, [type]);

  useEffect(() => {
    if (type >= 0 && type <= 4) {
      setToggle(type);
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
      });
    } else {
      navigate("/404");
    }
  }, [type]);

  const showProfile = toggle === 4 && user && !userError;
  const profileNeedLogin = toggle === 4 && !userLoading && (!user || userError);

  return (
    <PostInputModalContext.Provider value={{ postInputOpen, setPostInputOpen }}>
      <AppLayout>
        {toggle === 0 && <Home />}
        {toggle === 1 && <Tips />}
        {toggle === 2 && <FreeBoard />}
        {toggle === 3 && <Gallery />}
        {toggle === 4 && userLoading && <Loading />}
        {showProfile && <Profile />}
        {profileNeedLogin && (
          <ProfileGateWrap>
            <p>프로필은 로그인 후 이용할 수 있습니다.</p>
            <button type="button" onClick={() => navigate("/login")}>
              로그인
            </button>
            <button type="button" className="sub" onClick={() => navigate("/main/0")}>
              홈으로
            </button>
          </ProfileGateWrap>
        )}
      </AppLayout>
    </PostInputModalContext.Provider>
  );
};

export default Main;

const ProfileGateWrap = styled.div`
  padding: 48px 24px;
  text-align: center;
  color: rgba(0, 0, 0, 0.65);

  p {
    margin-bottom: 24px;
    font-size: 16px;
  }

  button {
    margin: 0 6px;
    padding: 10px 20px;
    border-radius: 999px;
    border: 2px solid rgba(0, 0, 0, 0.08);
    background: #c7d7ff;
    font-weight: 600;
    cursor: pointer;
  }

  button.sub {
    background: #fff;
  }
`;
