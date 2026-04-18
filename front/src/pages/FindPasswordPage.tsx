import React from "react";
import AuthPageLayout from "../components/auth/AuthPageLayout";
import FindPassword from "../components/startPage/FindPassword";

const FindPasswordPage = () => {
  return (
    <AuthPageLayout>
      <FindPassword />
    </AuthPageLayout>
  );
};

export default FindPasswordPage;
