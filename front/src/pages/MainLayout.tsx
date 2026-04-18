import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { PostInputModalContext } from "../context/PostInputModalContext";
import AppLayout from "../components/AppLayout";

/** AppLayout + Outlet — 사이드바·홈바 유지, 본문만 교체 */
const MainLayout = () => {
  const [postInputOpen, setPostInputOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setPostInputOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  }, [location.pathname]);

  return (
    <PostInputModalContext.Provider value={{ postInputOpen, setPostInputOpen }}>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </PostInputModalContext.Provider>
  );
};

export default MainLayout;
