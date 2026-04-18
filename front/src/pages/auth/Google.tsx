import React, { ReactElement, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";

import User from "../../functions/reactQuery/User";
import { useNavigate } from "react-router-dom";

const Google = () => {
  const navigate = useNavigate();

  const socialLogIn = User.socialLogIn();
  const REDIRECT_URI = process.env.REACT_APP_BASE_URL + "/auth/google";
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;

  const code = new URL(window.location.href).searchParams.get("code");

  useEffect(() => {
    if (socialLogIn.isError) navigate("/");
  }, [socialLogIn]);

  if (code) {
    // console.log(code);
    try {
      axios
        .post(`https://oauth2.googleapis.com/token`, {
          grant_type: "authorization_code",
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          code
        })
        .then(async (res) => {
          // console.log(res);
          const access_token = res.data.access_token;
          console.log("access_token 발급");
          await axios
            .get("https://www.googleapis.com/userinfo/v2/me", {
              headers: {
                Authorization: `Bearer ${access_token}`
              }
            })
            .then((res) => {
              // console.log(res);
              const email = res.data.email;
              const profilePic = res.data.picture;
              // console.log(email, profilePic);
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
      console.error(err);
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

export default Google;

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
