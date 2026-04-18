import React, { useState } from "react";
import styled from "styled-components";
import User from "../../functions/reactQuery/User";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import Axios from "../../apis/Axios";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";

const SendEmail = () => {
  const navigate = useNavigate();
  const { email } = User.get().data;

  const [text, setText] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const mail = useMutation(
    ({ email, text }: { email: string; text: string }) => {
      return Axios.post("bot/mail", { email, text });
    },
    {
      onSuccess: () => {
        setSuccess(true);
      }
    }
  );

  const onSend = () => {
    if (text.length > 0) {
      mail.mutate({ email, text });
    } else {
      toast.error("문의 내용이 비어있습니다.");
    }
  };

  return (
    <Wrapper>
      {email && !success && (
        <>
          <Title>1:1 문의 메일</Title>
          <Input onChange={(e) => setText(e.currentTarget.value)} />
          <SubText>🚨 메일이 오지 않는 경우 스팸 보관함을 확인해 주세요.</SubText>
          <Button onClick={() => onSend()} disabled={mail.isLoading ? true : false}>
            {mail.isLoading ? <CircularProgress color="inherit" size={18} /> : "문의 하기"}
          </Button>
        </>
      )}
      {email && success && (
        <>
          <span></span>
          <Title>1:1 문의 메일</Title>
          <span>문의 메일 발송이 완료되었습니다. :)</span>
          <span></span>
          <span></span>
        </>
      )}
      {!email && (
        <>
          <span></span>
          <Title>1:1 문의 메일</Title>
          <span>로그인이 필요합니다 :(</span>
          <Button onClick={() => navigate("/login")}>로그인</Button>
          <span></span>
        </>
      )}
    </Wrapper>
  );
};

export default SendEmail;

const Wrapper = styled.div`
  width: 100%;
  height: 250px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`;

const Input = styled.textarea`
  padding: 16px;
  resize: none;

  width: 100%;
  height: 50%;
  flex-grow: 1;
  margin: 16px 0;

  border-radius: 8px;
  border: solid 2px rgba(0, 0, 0, 0.1);
  outline-style: none;

  font-weight: 400 !important;
  font-size: 16px;
`;

const Title = styled.span`
  font-weight: 600 !important;
  color: rgba(0, 0, 0, 0.8);
  font-size: 20px;
`;
const SubText = styled.span`
  font-weight: 400 !important;
  color: salmon;
  font-size: 13px;
`;

const Button = styled.button`
  width: 72px;
  height: 28px;

  border: solid 2px rgba(0, 0, 0, 0.05);
  border-radius: 20px;
  background-color: #cddcf3;

  color: rgba(0, 0, 0, 0.6);
  font-weight: 500;
  font-size: 12px;

  margin-top: 16px;

  display: flex;
  justify-content: center;
  align-items: center;
`;
