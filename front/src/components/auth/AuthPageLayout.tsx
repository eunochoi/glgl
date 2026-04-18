import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components/macro";
import LogInSignUp from "../../styles/LogInSignUp";
import AuthSnsSection from "./AuthSnsSection";

interface Props {
  children: React.ReactNode;
}

// 로그인·회원가입·비번찾기 공통 레이아웃 (폼 + 구분선 + SNS)
const AuthPageLayout = ({ children }: Props) => {
  const navigate = useNavigate();

  return (
    <PageRoot>
      <TopBar>
        <button type="button" className="back" onClick={() => navigate("/")}>
          ← 홈
        </button>
      </TopBar>
      <Card>
        {children}
        <LogInSignUp.Bar />
        <AuthSnsSection />
      </Card>
    </PageRoot>
  );
};

export default AuthPageLayout;

const PageRoot = styled.div`
  min-height: 100vh;
  min-height: calc(var(--vh, 1vh) * 100);
  background-color: #c7d6ff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 20px 48px;
  box-sizing: border-box;
`;

const TopBar = styled.div`
  width: 100%;
  max-width: 480px;
  margin-bottom: 8px;

  .back {
    border: none;
    background: none;
    font-size: 15px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.55);
    cursor: pointer;
    padding: 8px 4px;

    &:hover {
      color: rgba(0, 0, 0, 0.85);
    }
  }
`;

const Card = styled.div`
  width: 100%;
  max-width: 480px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 36px 28px 24px;
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 28px 20px 20px;
  }
`;
