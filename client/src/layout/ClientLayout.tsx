import { Outlet } from "react-router";
import Header from "../components/Client/Header";
import HeaderSkeleton from "../components/UI/HeaderSkeleton";
import { useAuthContext } from "../context/AuthContext";
import Footer from "../components/Client/Footer";

const ClientLayout = () => {
  const { isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <>
        <HeaderSkeleton />
        <div className="pt-16 lg:pt-20">
          <Outlet />
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="pt-16 lg:pt-20">
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default ClientLayout;
