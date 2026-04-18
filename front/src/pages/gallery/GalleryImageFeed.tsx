import InfiniteScroll from "react-infinite-scroll-component";
import ImageListItem from "@mui/material/ImageListItem";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import MainPageStyle from "../../styles/MainPage";
import { ImageListSC, Images } from "./Gallery.styles";

interface GalleryImage {
  src: string;
  PostId: number;
}

interface GalleryImageFeedProps {
  query: {
    data?: { pages: GalleryImage[][] };
    hasNextPage?: boolean;
    fetchNextPage: () => unknown;
  };
  cols: number;
  gap: number;
}

const GalleryImageFeed = ({ query, cols, gap }: GalleryImageFeedProps) => {
  const navigate = useNavigate();
  const { data, hasNextPage, fetchNextPage } = query;
  const total = data?.pages?.reduce((acc, page) => acc + page.length, 0) ?? 0;

  return (
    <Images>
      <InfiniteScroll
        hasMore={hasNextPage || false}
        loader={
          <MainPageStyle.LoadingIconWrapper>
            <CircularProgress size={96} color="inherit" />
          </MainPageStyle.LoadingIconWrapper>
        }
        next={() => fetchNextPage()}
        dataLength={total}
      >
        {data?.pages.map((p, i) => (
          <ImageListSC key={i} variant="masonry" cols={cols} gap={gap}>
            {p.map((image) => (
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
  );
};

export default GalleryImageFeed;
