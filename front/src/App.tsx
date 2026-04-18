import React, { useEffect, useState } from "react";
import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import GlobalStyle from "./styles/GlobalStyle";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useModalStack } from "./store/modalStack";
import { useBrowserCheck } from "./store/borowserCheck";
import { ToastContainer } from "react-toastify";

//external css
import "react-toastify/dist/ReactToastify.css";

//Pages
const Start = lazy(() => import("./pages/Start"));
const MainLayout = lazy(() => import("./pages/MainLayout"));
const Home = lazy(() => import("./pages/home/Home"));
const Tips = lazy(() => import("./pages/tip/Tips"));
const FreeBoard = lazy(() => import("./pages/free/FreeBoard"));
const Gallery = lazy(() => import("./pages/gallery/Gallery"));
const ProfileRoute = lazy(() => import("./pages/ProfileRoute"));
const UserInfo = lazy(() => import("./pages/UserInfo"));
const PostView = lazy(() => import("./pages/PostView"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const FindPasswordPage = lazy(() => import("./pages/FindPasswordPage"));

import Loading from "./pages/Loading";
import Kakao from "./pages/auth/Kakao";
import Google from "./pages/auth/Google";
import { LegacyMainRedirect, LegacyProfileFromMain } from "./routes/LegacyRedirects";

function App() {
  const { modalStack } = useModalStack();
  const { setBrowser } = useBrowserCheck();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false
          }
        }
      })
  );

  const updateMobileViewport = () => {
    const vh = window.visualViewport?.height;
    const vw = window.visualViewport?.width;

    if (vh && vw) {
      if (vh > vw && vw == window.innerWidth) {
        document.documentElement.style.setProperty("--vh", `${vh * 0.01}px`);
      }
      if (vw > vh && vh == window.innerHeight) {
        document.documentElement.style.setProperty("--vh", `${vh * 0.01}px`);
      }
    }
  };

  if (visualViewport) {
    visualViewport.onresize = () => {
      updateMobileViewport();
    };
  }

  useEffect(() => {
    console.log(modalStack);
  }, [modalStack.length]);

  useEffect(() => {
    setBrowser();
    updateMobileViewport();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover
        theme="light"
      />
      <Router>
        <GlobalStyle />
        <Suspense fallback={<Loading></Loading>}>
          <Routes>
            <Route path="postview/:id" element={<PostView />} />
            <Route path="userinfo/:id/cat/:cat" element={<UserInfo />} />
            <Route path="/" element={<Start />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/find-password" element={<FindPasswordPage />} />
            <Route path="/auth/kakao" element={<Kakao />} />
            <Route path="/auth/google" element={<Google />} />

            <Route path="/main/4/cat/:cat" element={<LegacyProfileFromMain />} />
            <Route path="/main/:type/*" element={<LegacyMainRedirect />} />

            <Route element={<MainLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/home/search/*" element={<Home />} />
              <Route path="/tip" element={<Tips />} />
              <Route path="/tip/search/*" element={<Tips />} />
              <Route path="/free" element={<FreeBoard />} />
              <Route path="/free/search/*" element={<FreeBoard />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/profile/:cat" element={<ProfileRoute />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
