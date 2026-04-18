import BookmarkIcon from "@mui/icons-material/Bookmark";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MessageIcon from "@mui/icons-material/Message";
import { useNavigate } from "react-router-dom";
import MainPageStyle from "../../styles/MainPage";
import Img from "../common/Img";
import { makeK } from "./mainPageUtils";
import type { TopPostItem } from "./types";

type LikeIconVariant = "bookmark" | "favorite";

interface TopPostsSectionProps {
  posts: TopPostItem[] | undefined;
  subTitle: string;
  likeIcon?: LikeIconVariant;
}

const LikeIcon = ({ variant }: { variant: LikeIconVariant }) =>
  variant === "favorite" ? (
    <FavoriteIcon id="icon2" fontSize="inherit" />
  ) : (
    <BookmarkIcon id="icon" fontSize="inherit" />
  );

const TopPostsSection = ({ posts, subTitle, likeIcon = "bookmark" }: TopPostsSectionProps) => {
  const navigate = useNavigate();

  if (!posts || posts.length < 1) return null;

  return (
    <>
      <MainPageStyle.TextWrapper_SubBold>{subTitle}</MainPageStyle.TextWrapper_SubBold>
      <MainPageStyle.TopWrapper>
        {posts.map((v, i) => (
          <MainPageStyle.TopPostWrapper key={v.id ?? i}>
            <MainPageStyle.TopPost
              onClick={() => {
                navigate(`/postview/${v?.id}`);
              }}
            >
              {v?.Images?.length >= 1 ? (
                <Img alt="TopImage" id="image" src={v?.Images[0].src} />
              ) : (
                <span id="text">{v?.content}</span>
              )}
            </MainPageStyle.TopPost>
            <div id="info">
              <span>#{i + 1}</span>
              <span>
                <LikeIcon variant={likeIcon} /> {makeK(v?.LikeCount)}
              </span>
              <span>
                <MessageIcon id="icon" fontSize="inherit" /> {makeK(v?.Comments?.length)}
              </span>
            </div>
          </MainPageStyle.TopPostWrapper>
        ))}
      </MainPageStyle.TopWrapper>
    </>
  );
};

export default TopPostsSection;
