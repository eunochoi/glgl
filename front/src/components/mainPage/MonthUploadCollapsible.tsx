import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import type { ReactNode } from "react";
import MainPageStyle from "../../styles/MainPage";

interface MonthUploadCollapsibleProps {
  /** 펼침 토글 — 상단 "This Month" 행 클릭 */
  onToggle: () => void;
  /** New Upload 통계 줄 */
  showStats: boolean;
  children: ReactNode;
}

/** Tips/Free — 이번 달 업로드 수 접기/펼치기 + 통계 한 줄 */
const MonthUploadCollapsible = ({ onToggle, showStats, children }: MonthUploadCollapsibleProps) => {
  return (
    <>
      <MainPageStyle.TextWrapper_Bold onClick={onToggle}>
        <CalendarMonthIcon id="icon" fontSize="large" />
        This Month
      </MainPageStyle.TextWrapper_Bold>
      <MainPageStyle.Space height={8} />
      {showStats && children}
    </>
  );
};

export default MonthUploadCollapsible;
