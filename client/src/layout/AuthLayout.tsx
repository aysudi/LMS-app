import { Outlet } from "react-router";
import ScrollToTop from "../components/Common/ScrollToTop";

const AuthLayout = () => {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
};
export default AuthLayout;
