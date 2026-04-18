import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

//styled component
import LogInSignUp from "../../styles/LogInSignUp";
import User from "../../functions/reactQuery/User";

//mui
import CircularProgress from "@mui/material/CircularProgress";

interface LogInForm {
  email: string;
  password: string;
}

const LogIn = () => {
  const navigate = useNavigate();
  const login = User.logIn();

  const {
    register,
    formState: { errors, isDirty, isValid },
    handleSubmit,
    getValues
  } = useForm<LogInForm>({
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: ""
    }
  });
  const onSubmit = () => {
    const { email, password } = getValues();
    if (login.isLoading === false) {
      login.mutate({ email, password });
    }
  };

  return (
    <LogInSignUp.Wrapper>
      <LogInSignUp.Title>로그인</LogInSignUp.Title>
      <LogInSignUp.Form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <LogInSignUp.Input
          autoComplete="new-password"
          placeholder="이메일"
          type="email"
          {...register("email", {
            required: {
              value: true,
              message: "이메일을 입력해주세요."
            }
          })}
        />
        <LogInSignUp.WarningText>{errors.email?.message}</LogInSignUp.WarningText>
        <LogInSignUp.Input
          placeholder="비밀번호"
          autoComplete="current-password"
          type="password"
          {...register("password", {
            required: {
              value: true,
              message: "비밀번호를 입력해주세요."
            }
          })}
        />
        <LogInSignUp.WarningText>{errors.password?.message}</LogInSignUp.WarningText>
        <LogInSignUp.TextWrapper>
          <LogInSignUp.Text color="#4284F3" pointer={true} onClick={() => navigate("/find-password")}>
            혹시 비밀번호를 잊으셨나요?
          </LogInSignUp.Text>
        </LogInSignUp.TextWrapper>
        <LogInSignUp.Button disabled={!isDirty || !isValid || login.isLoading} bgColor="">
          {login.isLoading ? <CircularProgress size={24} color="inherit" /> : "로그인"}
        </LogInSignUp.Button>
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

export default LogIn;
