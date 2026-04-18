import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

//styled component
import LogInSignUp from "../../styles/LogInSignUp";
import styled from "styled-components";

//mui
import CircularProgress from "@mui/material/CircularProgress";
import Auth from "../../functions/reactQuery/Auth";

interface Form {
  email: string;
}
const FindPassword = () => {
  const navigate = useNavigate();
  const [authCodeConfirm, setAuthCodeConfirm] = useState(false);
  const [codeRequest, setCodeRequest] = useState(false);

  const [code, setCode] = useState("");
  const [authCode, setAuthCode] = useState("");

  const [counter, setCounter] = useState<number>(181);
  const [timer, setTimer] = useState<NodeJS.Timeout>();

  //mutation
  const codeSendForFindPW = Auth.codeSendForFindPW();
  const passwordUpdate = Auth.passwordUpdate();
  const codeCheck = Auth.codeCheck();

  const counteDownStart = () => {
    countDownStop();
    setTimer(
      setInterval(() => {
        setCounter((c) => c - 1);
      }, 1000)
    );
  };
  const countDownStop = () => {
    setCounter(181);
    clearTimeout(timer);
  };
  useEffect(() => {
    if (counter === 0) {
      setAuthCode("");
      countDownStop();
    }
  }, [counter]);

  const onSubmit = () => {
    const { email } = getValues();
    passwordUpdate.mutate(
      { email },
      {
        onSuccess: () => {
          toast.success("이메일로 임시 비밀번호가 발송되었습니다.");
          navigate("/login");
        },
        onError: () => {
          toast.error("에러 발생 임시 비밀번호 발송 실패");
        }
      }
    );
  };

  const {
    register,
    formState: { errors, isDirty, isValid },
    watch,
    handleSubmit,
    getValues
  } = useForm<Form>({
    mode: "onBlur",
    defaultValues: {
      email: ""
    }
  });

  return (
    <LogInSignUp.Wrapper>
      <LogInSignUp.Title>비밀번호 초기화</LogInSignUp.Title>

      <LogInSignUp.Input
        placeholder="이메일"
        type="email"
        {...register("email", {
          required: {
            value: true,
            message: "이메일을 입력해주세요."
          },
          maxLength: {
            value: 30,
            message: "최대 30자 입력가능합니다."
          },
          pattern: {
            value: /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i,
            message: "이메일 형식에 맞지 않습니다."
          }
        })}
      ></LogInSignUp.Input>
      <LogInSignUp.WarningText>{errors.email?.message}</LogInSignUp.WarningText>

      <LogInSignUp.Form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        {authCodeConfirm ? (
          <SignUpButton type="submit" bgColor="">
            {passwordUpdate.isLoading ? <CircularProgress color="inherit" size={24} /> : <span>비밀번호 초기화</span>}
          </SignUpButton>
        ) : (
          <AuthCodeWrapper>
            <input placeholder="인증 코드" value={code} onChange={(e) => setCode(e.target.value)} />
            {codeRequest && (
              <AuthCodeConfirmButton
                onClick={async () => {
                  //인증코드 확인, code : 입력한 코드, authCode : 인증 코드(해쉬)
                  codeCheck.mutate(
                    { code, authCode },
                    {
                      onSuccess: (res) => {
                        if (res.data.result) {
                          setAuthCodeConfirm(true);
                          clearTimeout(timer);
                          toast.success("인증코드 확인 완료");
                        } else {
                          toast.error("인증코드가 올바르지 않습니다.");
                        }
                      },
                      onError: () => {
                        toast.error("인증코드 확인 과정 중 오류 발생.");
                      }
                    }
                  );
                }}
              >
                <span>확인</span>
                <span>{counter !== 181 && `(${counter})`}</span>
              </AuthCodeConfirmButton>
            )}

            <AuthCodeSendButton
              onClick={() => {
                const { email } = getValues();
                if (email) {
                  //이메일로 보낸 코드를 리턴 = axios 코드 발송 api
                  codeSendForFindPW.mutate(
                    { email },
                    {
                      onSuccess: (res) => {
                        setAuthCode(res.data.code);
                        setCodeRequest(true);
                        countDownStop();
                        counteDownStart();

                        toast.success("인증코드가 발송되었습니다.");
                      },
                      onError: (res: any) => {
                        toast.error(res.response.data);
                      }
                    }
                  );
                } else {
                  toast.error("입력이 올바르지않습니다.");
                }
              }}
            >
              {codeSendForFindPW.isLoading ? (
                <CircularProgress color="inherit" size={24} />
              ) : (
                <>
                  <span>인증 코드</span>
                  <span>발송</span>
                </>
              )}
            </AuthCodeSendButton>
          </AuthCodeWrapper>
        )}
      </LogInSignUp.Form>

      <LogInSignUp.TextWrapper>
        <LogInSignUp.Text color="" pointer={false}>
          아직 회원이 아니신가요?
        </LogInSignUp.Text>
        <LogInSignUp.Text color="#4284F3" pointer={true} onClick={() => navigate("/signup")}>
          회원가입
        </LogInSignUp.Text>
      </LogInSignUp.TextWrapper>
    </LogInSignUp.Wrapper>
  );
};

export default FindPassword;

const SignUpButton = styled.button<{ bgColor: string }>`
  transition: all 0.7s ease-in-out;
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 6px;
  background-color: rgb(190, 190, 231);
  color: white;
  font-size: 16px;
  font-weight: 500;
  flex-shrink: 0;
  box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.1);
  &:disabled {
    background-color: lightgrey;
  }
`;
const AuthCodeWrapper = styled.div`
  display: flex;

  width: 100%;
  input {
    height: 50px;
    width: 100%;
    flex-grow: 1 !important;

    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;

    font-size: 16px;
    font-weight: 500;

    padding-left: 15px;
    box-sizing: border-box;

    border-left: 1px solid #cacaca;
    border-top: 1px solid #cacaca;
    border-bottom: 1px solid #cacaca;
    border-right: none;
    outline: none;
  }
`;

const AuthCodeSendButton = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  width: 140px;
  height: 50px;
  background-color: #c7d7ff;
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;

  border: 1px solid #cacaca;

  cursor: pointer;

  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  span {
    font-weight: 500;
  }
  span:nth-child(2) {
    margin-top: 4px;
  }
`;

const AuthCodeConfirmButton = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  width: 140px !important;
  height: 50px;
  background-color: #d8e3ff;

  border: 1px solid #cacaca;
  border-right: none;

  cursor: pointer;

  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  span {
    font-weight: 500;
  }
  span:nth-child(2) {
    margin-top: 4px;
  }
`;
