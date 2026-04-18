import MainPageStyle from "../../styles/MainPage";

const TipsIntro = () => {
  return (
    <>
      <MainPageStyle.TextWrapper_Title>Tip Board</MainPageStyle.TextWrapper_Title>
      <MainPageStyle.Space height={16} />
      <MainPageStyle.TextWrapper_Normal>팁과 설정을 공유하고 배우는 게시판입니다.</MainPageStyle.TextWrapper_Normal>
      <MainPageStyle.TextWrapper_Normal>GTS와 드랍십을 활용해보세요!</MainPageStyle.TextWrapper_Normal>
      <MainPageStyle.Space height={48} />
    </>
  );
};

export default TipsIntro;
