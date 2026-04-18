import React from "react";
import styled from "styled-components";

const Img = ({
  className,
  id,
  src,
  alt,
  crop,
  loading,
  width,
  height,
  onClick
}: {
  className?: string;
  id?: string;
  src: string;
  alt: string;
  crop?: boolean;
  width?: string;
  height?: string;
  loading?: "lazy" | "eager" | undefined;

  onClick?: () => void;
}) => {
  const failImg = "/img/loadingFailed.png";

  // 로드 실패 시 대체 이미지 한 번만 시도 (대체 이미지까지 실패하면 onerror 제거로 무한 루프 방지)

  return (
    <ImgSC
      onClick={onClick}
      crop={crop ? crop : false}
      loading={loading ? loading : undefined}
      className={className}
      id={id}
      src={src}
      alt={alt}
      width={width}
      height={height}
      onError={(e) => {
        console.log("error occur in image loading");
        const el = e.currentTarget;
        if (el.src.includes(failImg)) {
          el.onerror = null;
          return;
        }
        el.src = failImg;
      }}
    />
  );
};

export default Img;

const ImgSC = styled.img<{ crop: boolean }>`
  object-fit: ${(props) => (props.crop ? "cover" : "contain")};

  image-orientation: none;

  -ms-user-select: none;
  -moz-user-select: -moz-none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  user-select: none;
`;
