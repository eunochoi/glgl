import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const AuthSnsSection = () => {
  const navigate = useNavigate();

  const KAKAO_REST_KEY = process.env.REACT_APP_KAKAO_REST_KEY;
  const REDIRECT_URI_KAKAO = process.env.REACT_APP_BASE_URL + "/auth/kakao";

  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const REDIRECT_URI_GOOGLE = process.env.REACT_APP_BASE_URL + "/auth/google";

  const googleLogin = () => {
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI_GOOGLE}&response_type=code&scope=email profile&prompt=select_account`;
  };

  const kakaoLogin = () => {
    window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_KEY}&redirect_uri=${REDIRECT_URI_KAKAO}&response_type=code&prompt=select_account`;
  };

  return (
    <>
      <SNSLoginWrapper>
        <SNSButtonWrapper>
          <SNSLoginButton type="button" color="white" onClick={googleLogin}>
            <Logo src={`${process.env.PUBLIC_URL}/img/google.png`} alt="google" />
          </SNSLoginButton>
          <span>google</span>
        </SNSButtonWrapper>

        <SNSButtonWrapper>
          <SNSLoginButton type="button" color="#FAE100" onClick={kakaoLogin}>
            <Logo src={`${process.env.PUBLIC_URL}/img/kakao.png`} alt="kakao" />
          </SNSLoginButton>
          <span>kakao</span>
        </SNSButtonWrapper>
      </SNSLoginWrapper>
      <BrowseWithoutLoginLink type="button" onClick={() => navigate("/home")}>
        로그인 없이 구경하기
      </BrowseWithoutLoginLink>
    </>
  );
};

export default AuthSnsSection;

const SNSButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  > span {
    font-weight: 500;
    text-transform: capitalize;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.6);
    margin-top: 8px;
  }
`;

const SNSLoginWrapper = styled.div`
  width: 100%;
  height: auto;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 32px 0 8px;
`;

const BrowseWithoutLoginLink = styled.button`
  display: block;
  margin: 24px auto 12px;
  padding: 0;

  font-size: 15px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.55);
  text-decoration: underline;
  text-underline-offset: 4px;

  background: none;
  border: none;
  cursor: pointer;

  &:hover {
    color: rgba(0, 0, 0, 0.75);
  }
`;

const SNSLoginButton = styled.button<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 48px;

  border: 2px solid rgba(0, 0, 0, 0.1);

  display: flex;
  justify-content: center;
  align-items: center;

  background-color: ${(props) => props.color};
  color: black;
  margin: 0 10px;
`;

const Logo = styled.img`
  width: 70%;
  height: 70%;
  object-fit: contain;
`;
