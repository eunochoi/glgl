import MainPageStyle from "../../styles/MainPage";

const FreeBoardIntro = () => {
  return (
    <>
      <MainPageStyle.TextWrapper_Title>Free Board</MainPageStyle.TextWrapper_Title>
      <MainPageStyle.Space height={16} />
      <MainPageStyle.TextWrapper_Normal>자유 주제로 이야기를 나누는 게시판입니다.</MainPageStyle.TextWrapper_Normal>
      <MainPageStyle.TextWrapper_Normal>서로에게 존중과 배려를 보여주세요 :)</MainPageStyle.TextWrapper_Normal>
      <MainPageStyle.Space height={48} />
    </>
  );
};

export default FreeBoardIntro;
