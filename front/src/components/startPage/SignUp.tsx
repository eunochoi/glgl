import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-toastify";
import Axios from "../../apis/Axios";
import { useNavigate } from "react-router-dom";

//styled component
import LogInSignUp from "../../styles/LogInSignUp";
import User from "../../functions/reactQuery/User";
import styled from "styled-components";
import Auth from "../../functions/reactQuery/Auth";

//mui
import CircularProgress from "@mui/material/CircularProgress";

interface SignInForm {
  email: string;
  nickname: string;
  password: string;
  passwordCheck: string;
}
const SignUp = () => {
  const navigate = useNavigate();
  const {
    register,
    formState: { errors, isDirty, isValid },
    watch,
    handleSubmit,
    getValues
  } = useForm<SignInForm>({
    mode: "onBlur",
    defaultValues: {
      email: "",
      nickname: "",
      password: "",
      passwordCheck: ""
    }
  });

  const [authCodeConfirm, setAuthCodeConfirm] = useState(false);
  const [codeRequest, setCodeRequest] = useState(false);

  const [code, setCode] = useState("");
  const [authCode, setAuthCode] = useState("");

  const [counter, setCounter] = useState<number>(181);
  const [timer, setTimer] = useState<NodeJS.Timeout>();

  //mutation
  const signUP = User.signUp();
  const codeSendForSignUP = Auth.codeSendForSignUp();
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
    const { email, nickname, password } = getValues();
    signUP.mutate(
      { email, nickname, password },
      {
        onSuccess: () => {
          navigate("/login");
        }
      }
    );
  };

  return (
    <LogInSignUp.Wrapper>
      <LogInSignUp.Title>회원가입</LogInSignUp.Title>
      <LogInSignUp.Form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
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
        <LogInSignUp.Input
          placeholder="닉네임"
          type="text"
          {...register("nickname", {
            required: {
              value: true,
              message: "닉네임을 입력해주세요."
            },
            maxLength: {
              value: 8,
              message: "최대 8자 입력가능합니다."
            },
            pattern: {
              value: /^(?=.*[a-z0-9가-힣])[a-z0-9가-힣]{2,10}$/i,
              message: "2자 이상 10자 이하, 영어 또는 숫자 또는 한글"
            }
          })}
        ></LogInSignUp.Input>
        <LogInSignUp.WarningText>{errors.nickname?.message}</LogInSignUp.WarningText>

        <LogInSignUp.Input
          placeholder="비밀번호"
          type="password"
          {...register("password", {
            required: {
              value: true,
              message: "비밀번호를 입력해주세요."
            },
            minLength: {
              value: 8,
              message: "최소 8자 이상 입력해주세요."
            },
            maxLength: {
              value: 30,
              message: "최대 30자 입력가능합니다."
            },
            pattern: {
              value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/i,
              message: "최소 8자, 영문자, 숫자, 특수 문자(@$!%*#?&) 최소 하나씩 포함 필요"
            }
          })}
        ></LogInSignUp.Input>
        <LogInSignUp.WarningText>{errors.password?.message}</LogInSignUp.WarningText>
        <LogInSignUp.Input
          placeholder="비밀번호 확인"
          type="password"
          {...register("passwordCheck", {
            required: {
              value: true,
              message: "비밀번호를 입력해주세요."
            },
            minLength: {
              value: 8,
              message: "최소 8자 이상 입력해주세요."
            },
            maxLength: {
              value: 30,
              message: "최대 30자 입력가능합니다."
            },
            pattern: {
              value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/i,
              message: "최소 8자, 영문자, 숫자, 특수 문자(@$!%*#?&) 최소 하나씩 포함 필요"
            },
            validate: (value: string) => {
              if (watch("password") != value) {
                return "비밀번호가 일치하지 않습니다.";
              }
            }
          })}
        ></LogInSignUp.Input>

        <LogInSignUp.FakePassword></LogInSignUp.FakePassword>
        <LogInSignUp.FakePassword></LogInSignUp.FakePassword>

        <LogInSignUp.WarningText>{errors.passwordCheck?.message}</LogInSignUp.WarningText>
        {authCodeConfirm ? (
          <SignUpButton type="submit" disabled={!isDirty || !isValid} bgColor="">
            {signUP.isLoading ? <CircularProgress size={24} color="inherit" /> : "회원가입"}
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
                  codeSendForSignUP.mutate(
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
                  toast.error("이메일 정보가 올바르지않습니다.");
                }
              }}
            >
              {codeSendForSignUP.isLoading ? (
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
          이미 계정이 있으신가요?
        </LogInSignUp.Text>
        <LogInSignUp.Text
          color="#4284F3"
          pointer={true}
          onClick={() => {
            setCodeRequest(false);
            setAuthCodeConfirm(false);
            setCounter(181);
            setAuthCode("");
            navigate("/login");
          }}
        >
          로그인
        </LogInSignUp.Text>
      </LogInSignUp.TextWrapper>
    </LogInSignUp.Wrapper>
  );
};

export default SignUp;

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
  border: 1px solid rgba(0, 0, 0, 0.1);

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
