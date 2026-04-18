import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import MainPageStyle from "../../styles/MainPage";

interface HomeIntroProps {
  nickname?: string;
}

const HomeIntro = ({ nickname }: HomeIntroProps) => {
  return (
    <>
      <MainPageStyle.TextWrapper_Title>home</MainPageStyle.TextWrapper_Title>
      <MainPageStyle.Space height={32} />
      <MainPageStyle.TextWrapper_Bold>
        {nickname ? (
          <>
            반갑습니다. {nickname.slice(0, 8)}님 <EmojiPeopleIcon style={{ fontSize: "36px" }} />
          </>
        ) : (
          "반갑습니다."
        )}
      </MainPageStyle.TextWrapper_Bold>
      <MainPageStyle.Space height={24} />
      <MainPageStyle.TextWrapper_Normal>굿락갓락은 갤럭시 팁 공유 커뮤니티입니다.</MainPageStyle.TextWrapper_Normal>
      <MainPageStyle.TextWrapper_Normal>갤럭시&굿락 팁을 자유롭게 나눠보세요. :)</MainPageStyle.TextWrapper_Normal>
    </>
  );
};

export default HomeIntro;
