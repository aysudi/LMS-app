import { Outlet } from "react-router";
import Header from "../components/Client/Header";
import HeaderSkeleton from "../components/UI/HeaderSkeleton";
import { useAuthContext } from "../context/AuthContext";

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
    </>
  );
};

export default ClientLayout;
