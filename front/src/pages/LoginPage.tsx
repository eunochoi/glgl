import React from "react";
import AuthPageLayout from "../components/auth/AuthPageLayout";
import LogIn from "../components/startPage/LogIn";

const LoginPage = () => {
  return (
    <AuthPageLayout>
      <LogIn />
    </AuthPageLayout>
  );
};

export default LoginPage;
