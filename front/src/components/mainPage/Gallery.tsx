import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import Axios from "../../apis/Axios";
import MainPageStyle from "../../styles/MainPage";
import IsMobile from "../../functions/IsMobile";
import FloatingActionBar from "../layout/FloatingActionBar";
import GalleryImageFeed from "./gallery/GalleryImageFeed";
import { scrollToTextWrapperBottom } from "./scrollMainPageText";
import { Pill, TextWrapper, Wrapper } from "./gallery/Gallery.styles";

const Gallery = () => {
  const scrollTarget = useRef<HTMLDivElement | null>(null);
  const [toggle, setToggle] = useState<number>(0);
  const [cols, setCols] = useState<number>(3);
  const isMobile = IsMobile();

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
            scrollToTextWrapperBottom(scrollTarget);
          }}
        >
          Tip Posts
        </Pill.Sub>
        <Pill.Sub
          toggle={toggle}
          onClick={() => {
            setToggle(1);
            scrollToTextWrapperBottom(scrollTarget);
          }}
        >
          Free Posts
        </Pill.Sub>
      </Pill.Wrapper>
      {toggle === 0 && <GalleryImageFeed query={tipImages} cols={cols} gap={12} />}
      {toggle === 1 && <GalleryImageFeed query={freeImages} cols={cols} gap={8} />}
    </Wrapper>
  );
};

export default Gallery;
