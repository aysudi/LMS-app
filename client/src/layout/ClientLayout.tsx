import { Outlet } from "react-router";
import Header from "../components/Client/Header";
import HeaderSkeleton from "../components/UI/HeaderSkeleton";
import { useAuthContext } from "../context/AuthContext";
import Footer from "../components/Client/Footer";
import ScrollToTop from "../components/Common/ScrollToTop";

const ClientLayout = () => {
  const { isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <>
        <ScrollToTop />
        <HeaderSkeleton />
        <div className="pt-16 lg:pt-20">
          <Outlet />
        </div>
      </>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Header />
      <div className="pt-16 lg:pt-20">
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default ClientLayout;
