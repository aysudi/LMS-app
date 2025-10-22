import { Outlet } from "react-router-dom";
import Header from "../components/Client/Header";

const ChatLayout = () => {
  return (
    <>
      <Header />
      <div className="pt-16 lg:pt-20">
        <Outlet />
      </div>
    </>
  );
};

export default ChatLayout;
