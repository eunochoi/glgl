import React, { useEffect } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import Axios from "../apis/Axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// import { Helmet } from "react-helmet";

//components
import AppLayout from "../components/AppLayout";
import FloatingActionBar from "../components/layout/FloatingActionBar";
import Post from "../components/common/Post";
import Animation from "../styles/Animation";

//mui

const PostView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  //리액트 쿼리 id로 단일 포스트 값 불러오기
  const single = useQuery(["single"], () =>
    Axios.get("post/single", { params: { id: Number(id) } }).then((v) => v.data)
  );
  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  };

  useEffect(() => {
    scrollTop();
  });
  useEffect(() => {
    if (single.isError) {
      toast.error("공유 링크가 올바르지 않습니다.");
      navigate("/");
    }
  }, [single.isError]);

  const title = ["Notice", "Tip Post", "Free Post"];

  return (
    <AppLayout>
      <FloatingActionBar />
      <SinglePostWrapper>
        <SingePostText>
          {/* <ShareIcon fontSize="large" /> */}
          <span>{title[single?.data?.type]}</span>
        </SingePostText>
        {single.data && <Post key={"singlePost"} postProps={single.data} />}
      </SinglePostWrapper>
    </AppLayout>
  );
};

export default PostView;
const SinglePostWrapper = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;

  animation: ${Animation.smoothAppear} 1s ease-in-out;

  @media (orientation: landscape) and (max-height: 480px) {
    width: 80%;
  }
`;
const SingePostText = styled.div`
  width: 550px;
  padding-top: 64px;
  /* padding-left: calc((70vw - 500px) / 2); */
  padding-bottom: 32px;
  color: rgba(0, 0, 0, 0.75);

  span {
    font-size: 44px;
    font-weight: 700;
    text-transform: uppercase;
    color: rgba(0, 0, 0, 0.7);
  }

  @media (orientation: portrait) {
    width: 100%;
    padding-left: 4vw;
    padding-top: 100px;
  }
  @media (orientation: landscape) and (max-height: 480px) {
    /* width: 480px; */
    width: 100%;
    padding-top: 60px;
  }
`;
