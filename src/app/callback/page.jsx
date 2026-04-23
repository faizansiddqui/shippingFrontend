import React from "react";
import AuthCallback from "../components/AuthCallBack";

const page = () => {
  return (
    <div>
      <React.Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            Loading...
          </div>
        }
      >
        <AuthCallback />
      </React.Suspense>
    </div>
  );
};

export default page;
