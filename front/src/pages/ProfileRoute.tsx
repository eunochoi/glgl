import { useNavigate } from "react-router-dom";
import styled from "styled-components/macro";
import Profile from "./profile/Profile";
import User from "../functions/reactQuery/User";
import Loading from "./Loading";

/** /profile/:cat — 로그인 게이트 후 Profile */
const ProfileRoute = () => {
  const navigate = useNavigate();
  const { data: user, isLoading: userLoading, isError: userError } = User.get();

  if (userLoading) {
    return <Loading />;
  }

  if (!user || userError) {
    return (
      <ProfileGateWrap>
        <p>프로필은 로그인 후 이용할 수 있습니다.</p>
        <button type="button" onClick={() => navigate("/login")}>
          로그인
        </button>
        <button type="button" className="sub" onClick={() => navigate("/home")}>
          홈으로
        </button>
      </ProfileGateWrap>
    );
  }

  return <Profile />;
};

export default ProfileRoute;

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
