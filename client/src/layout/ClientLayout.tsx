import { Outlet } from "react-router";
import Header from "../components/Client/Header";
import { useAuthContext } from "../context/AuthContext";

const ClientLayout = () => {
  const { user } = useAuthContext();

  return (
    <>
      <Header user={user} />
      <Outlet />
    </>
  );
};

export default ClientLayout;
