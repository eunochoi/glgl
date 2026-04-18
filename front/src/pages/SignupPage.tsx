import React from "react";
import AuthPageLayout from "../components/auth/AuthPageLayout";
import SignUp from "../components/startPage/SignUp";

const SignupPage = () => {
  return (
    <AuthPageLayout>
      <SignUp />
    </AuthPageLayout>
  );
};

export default SignupPage;
