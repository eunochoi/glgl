import MainPageStyle from "../../styles/MainPage";
import { shortTag } from "./boardUtils";

export interface TagSectionConfig {
  subTitle: string;
  tags: { id: number; name: string }[] | undefined;
  onTagClick: (name: string) => void;
  /** 보드별로 자름 길이가 다름 */
  tagMaxLen: number;
}

interface PopularTagsSidebarProps {
  sections: TagSectionConfig[];
}

const PopularTagsSidebar = ({ sections }: PopularTagsSidebarProps) => {
  return (
    <div id="tags">
      <span className="title">Popular Tag</span>
      <MainPageStyle.Space height={24} />
      {sections.map((sec, idx) => (
        <section key={sec.subTitle}>
          {idx > 0 && <MainPageStyle.Space height={24} />}
          <span className="subTitle">{sec.subTitle}</span>
          {sec.tags?.map((v) => (
            <span
              id="tagItem"
              key={v?.id}
              onClick={() => {
                sec.onTagClick(v?.name);
              }}
            >
              #{shortTag(v?.name, sec.tagMaxLen)}
            </span>
          ))}
        </section>
      ))}
    </div>
  );
};

export default PopularTagsSidebar;
