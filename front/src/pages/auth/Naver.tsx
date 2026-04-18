import React, { useEffect } from "react";
import styled from "styled-components";
import Axios from "../../apis/Axios";

import User from "../../functions/reactQuery/User";
import { useNavigate } from "react-router-dom";

const Naver = () => {
  const navigate = useNavigate();
  //kakao login
  const socialLogIn = User.socialLogIn();

  const NAVER_CLIENT_ID = process.env.REACT_APP_NAVER_CLIENT_ID;
  const NAVER_CLIENT_SECRET = process.env.REACT_APP_NAVER_CLIENT_SECRET;
  const NAVER_STATE_CODE = process.env.REACT_APP_NAVER_STATE_CODE;
  const REDIRECT_URI = process.env.REACT_APP_BASE_URL + "/auth/naver";
  const code = new URL(window.location.href).searchParams.get("code");

  //naver 로그인의 경우 front에서 바로 네이버 api를 보내면 cors 에러가 발생한다.
  //구글이나 카카오와 다르게 요청을 백엔드에서 보내야 한다.

  useEffect(() => {
    if (socialLogIn.isError) navigate("/");
  }, [socialLogIn]);

  if (code) {
    console.log(code);
    try {
      Axios.post("auth/naverlogin", {
        client_id: NAVER_CLIENT_ID,
        client_secret: NAVER_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code,
        state: NAVER_STATE_CODE
      }).then((res) => {
        const email = res.data.email;
        const profilePic = res.data.profilePic;
        console.log(email, profilePic);
        socialLogIn.mutate(
          { email, profilePic },
          {
            onSuccess: () => {
              location.replace("/home");
              // navigate("/main/0");
            }
          }
        );
      });
      // .catch(() => navigate("/"));
    } catch (e) {
      navigate("/");
    }
  }

  return (
    <LoadingWrapper>
      <img src={`${process.env.PUBLIC_URL}/img/loading.png`}></img>
      <img src={`${process.env.PUBLIC_URL}/img/loading.gif`}></img>
    </LoadingWrapper>
  );
};

export default Naver;

const LoadingWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: whitesmoke;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  img:first-child {
    width: 150px;
    height: 150px;
    object-fit: contain;
  }
  img:nth-child(2) {
    width: 100px;
    height: 100px;
    object-fit: contain;
  }
`;
