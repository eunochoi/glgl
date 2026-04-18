import styled from "styled-components";
import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Animation from "../../styles/Animation";

import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import MainPageStyle from "../../styles/MainPage";

import Axios from "../../apis/Axios";

//function
import IsMobile from "../../functions/IsMobile";
import FloatingActionBar from "../layout/FloatingActionBar";

//mui
import CircularProgress from "@mui/material/CircularProgress";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";

const Gallery = () => {
  const scrollTarget = useRef<HTMLDivElement>(null);

  const [toggle, setToggle] = useState<number>(0);
  const [cols, setCols] = useState<number>(3);

  const isMobile = IsMobile();
  const navigate = useNavigate();

  //load posts
  const tipImages = useInfiniteQuery(
    ["tipImages"],
    ({ pageParam = 1 }) =>
      Axios.get("image", { params: { type: 1, pageParam, tempDataNum: 20 } }).then((res) => res.data),
    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === 0 ? undefined : allPages.length + 1;
      }
    }
  );
  const freeImages = useInfiniteQuery(
    ["freeImages"],
    ({ pageParam = 1 }) =>
      Axios.get("image", { params: { type: 2, pageParam, tempDataNum: 20 } }).then((res) => res.data),
    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === 0 ? undefined : allPages.length + 1;
      }
    }
  );

  //scroll when pill click
  const scrollTargerheight = () => {
    const height = scrollTarget.current?.scrollHeight;

    if (height && height < window?.scrollY) {
      window.scrollTo({
        top: scrollTarget.current?.scrollHeight,
        left: 0,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  }, []);

  useEffect(() => {
    if (isMobile) {
      setCols(2);
    } else {
      setCols(3);
    }
  }, [isMobile]);

  return (
    <Wrapper>
      <FloatingActionBar />
      <TextWrapper ref={scrollTarget}>
        <MainPageStyle.TextWrapper_Title>Gallery</MainPageStyle.TextWrapper_Title>
        <MainPageStyle.Space height={16}></MainPageStyle.Space>
        <MainPageStyle.TextWrapper_Normal>이미지 모음 게시판입니다.</MainPageStyle.TextWrapper_Normal>
        <MainPageStyle.TextWrapper_Normal>이미지를 클릭하면 포스트를 볼 수 있습니다.</MainPageStyle.TextWrapper_Normal>
      </TextWrapper>
      <Pill.Wrapper>
        <Pill.Sub
          toggle={toggle}
          onClick={() => {
            setToggle(0);
            scrollTargerheight();
          }}
        >
          Tip Posts
        </Pill.Sub>
        <Pill.Sub
          toggle={toggle}
          onClick={() => {
            setToggle(1);
            scrollTargerheight();
          }}
        >
          Free Posts
        </Pill.Sub>
      </Pill.Wrapper>
      {toggle == 0 && (
        <Images>
          <InfiniteScroll
            // scrollThreshold={0.5}
            hasMore={tipImages.hasNextPage || false}
            loader={
              <MainPageStyle.LoadingIconWrapper>
                <CircularProgress size={96} color="inherit" />
              </MainPageStyle.LoadingIconWrapper>
            }
            next={() => tipImages.fetchNextPage()}
            dataLength={tipImages.data?.pages.reduce((total, page) => total + page.length, 0) || 0}
          >
            {tipImages?.data?.pages.map((p, i) => (
              <ImageListSC key={i} variant="masonry" cols={cols} gap={12}>
                {p.map((image: { src: string; PostId: number }) => (
                  <ImageListItem key={image.src}>
                    <img
                      onClick={() => {
                        navigate(`/postview/${image.PostId}`);
                      }}
                      srcSet={`${image.src}?w=248&fit=crop&auto=format&dpr=2 2x`}
                      src={`${image.src}?w=248&fit=crop&auto=format`}
                      alt={image.src}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </ImageListItem>
                ))}
              </ImageListSC>
            ))}
          </InfiniteScroll>
        </Images>
      )}
      {toggle == 1 && (
        <Images>
          <InfiniteScroll
            // scrollThreshold={0.5}
            hasMore={freeImages.hasNextPage || false}
            loader={
              <MainPageStyle.LoadingIconWrapper>
                <CircularProgress size={96} color="inherit" />
              </MainPageStyle.LoadingIconWrapper>
            }
            next={() => freeImages.fetchNextPage()}
            dataLength={freeImages.data?.pages.reduce((total, page) => total + page.length, 0) || 0}
          >
            {freeImages?.data?.pages.map((p, i) => (
              <ImageListSC key={i} variant="masonry" cols={cols} gap={8}>
                {p.map((image: { src: string; PostId: number }) => (
                  <ImageListItem key={image.src}>
                    <img
                      onClick={() => {
                        navigate(`/postview/${image.PostId}`);
                      }}
                      srcSet={`${image.src}?w=248&fit=crop&auto=format&dpr=2 2x`}
                      src={`${image.src}?w=248&fit=crop&auto=format`}
                      alt={image.src}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </ImageListItem>
                ))}
              </ImageListSC>
            ))}
          </InfiniteScroll>
        </Images>
      )}
    </Wrapper>
  );
};

export default Gallery;

const ImageListSC = styled(ImageList)`
  margin-bottom: 12px;
`;
const Images = styled.div`
  animation: ${Animation.smoothAppear} 1s ease-in-out;

  width: 70%;
  min-height: 100vh;
  .MuiImageListItem-img {
    border: solid 2px rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    /* background-color: #fff;
    background-color: rgba(255, 255, 255, 0.7); */
  }

  @media (orientation: portrait) or (max-height: 480px) {
    width: 92vw;
  }
  @media (orientation: landscape) and (max-height: 480px) {
    width: 80%;
  }
`;

const Wrapper = styled.div`
  animation: ${Animation.smoothAppear} 0.5s ease-in-out;

  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  /* background-color: #fff; */
`;

const Pill = {
  Wrapper: styled.div`
    z-index: 80;
    position: sticky;
    top: 0px;

    background-color: white;

    display: flex;
    justify-content: start;
    align-items: center;

    padding-top: 24px;
    padding-bottom: 24px;
    /* padding-top: 12px;
    padding-bottom: 12px; */
    margin-bottom: 12px;

    width: 70%;
    overflow-x: scroll;

    @media (orientation: portrait) or (max-height: 480px) {
      top: 48px;
      top: 46px;
      /* background-color: #c8daf3; */
      /* background-color: #fff; */
      width: 100%;
      padding: 12px 4vw;
    }
    @media (orientation: landscape) and (max-height: 480px) {
      width: 80%;
      padding-left: 0;
      padding-right: 0;
      top: 0px;
    }

    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
    &::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera*/
    }
  `,
  Search: styled.button<{ toggle: boolean }>`
    transition: all ease-in-out 0.5s;
    padding: 8px 16px;
    width: ${(props) => (props.toggle ? "200px" : "56px")};
    border: solid 2px rgba(0, 0, 0, 0.05);
    height: 32px;
    border-radius: 100px;

    font-size: 18px;

    /* box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.3); */
    color: #464b53;
    background-color: #e3ecf9;
    background-color: ${({ toggle }) => toggle && "#f3e0f1"};

    form {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: start;
      align-items: center;
    }
    input {
      opacity: 0;
      transition: all ease-in-out 0.5s;
      outline: none;
      width: 0;
      height: 24px;
      font-size: 18px;
      border-radius: 100px;
      border: none;

      font-weight: 500;

      background-color: ${({ toggle }) => toggle && "rgba(255, 255, 255, 0.8)"};
      opacity: ${({ toggle }) => toggle && "1"};
      padding: ${({ toggle }) => toggle && "0 10px"};
      flex-grow: ${({ toggle }) => toggle && "1"};

      &::placeholder {
        color: rgba(0, 0, 0, 0.5);
        text-align: center;
      }
    }
    @media (orientation: portrait) or (max-height: 480px) {
      width: ${(props) => props.toggle && "50%"};
      flex-grow: ${({ toggle }) => toggle && "1"};
    }
  `,
  Sub: styled.button<{ toggle: number }>`
    flex-shrink: 0;
    transition: all ease-in-out 0.5s;
    height: 32px;
    padding: 0px 16px;
    margin-right: 8px;
    border-radius: 100px;
    border: solid 2px rgba(0, 0, 0, 0.05);

    font-size: 18px;
    font-weight: 500;

    display: flex;
    align-items: center;
    justify-content: center;

    color: #464b53;
    background-color: #e3ecf9;
    > span {
      margin-left: 4px;
      font-weight: 500;
    }
    &:nth-child(${(props) => props.toggle + 1}) {
      background-color: #f3e0f1;
    }
  `
};

const TextWrapper = styled.div`
  width: 70%;
  padding-top: 64px;
  padding-bottom: 24px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;

  @media (orientation: portrait) or (max-height: 480px) {
    width: 100%;
    padding-top: 72px;
    /* padding-left: 5vw; */
    margin-top: 48px; //header height
    padding-bottom: 24px;
  }
  @media (orientation: landscape) and (max-height: 480px) {
    width: 80%;
    padding-left: 0;
    margin-top: 0;
    padding-top: 24px;
  }
`;
