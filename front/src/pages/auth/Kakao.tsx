import React, { ReactElement, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";

import User from "../../functions/reactQuery/User";
import { useNavigate } from "react-router-dom";

const Kakao = () => {
  const navigate = useNavigate();
  //kakao login
  const socialLogIn = User.socialLogIn();

  const REST_KEY = process.env.REACT_APP_KAKAO_REST_KEY;
  const REDIRECT_URI = process.env.REACT_APP_BASE_URL + "/auth/kakao";
  const code = new URL(window.location.href).searchParams.get("code");

  useEffect(() => {
    if (socialLogIn.isError) navigate("/");
  }, [socialLogIn]);

  if (code) {
    try {
      axios
        .post(
          `https://kauth.kakao.com/oauth/token`,
          {
            grant_type: "authorization_code",
            client_id: REST_KEY,
            redirect_uri: REDIRECT_URI,
            code
          },
          {
            headers: {
              "Content-type": "application/x-www-form-urlencoded;charset=utf-8"
            }
          }
        )
        .then(async (res) => {
          const access_token = res.data.access_token;
          console.log("access_token 발급");
          await axios
            .get("https://kapi.kakao.com/v2/user/me", {
              headers: {
                Authorization: `Bearer ${access_token}`
              }
            })
            .then((res) => {
              // console.log(res);
              const email = res.data.kakao_account.email;
              const profilePic = res.data.properties.profile_image;
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
        });
      // .catch(() => {
      //   navigate("/");
      // });
    } catch (err) {
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

export default Kakao;

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
