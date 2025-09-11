import ClientLayout from "../layout/ClientLayout";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ResetPassword from "../pages/Auth/ResetPassword";
import VerifyEmail from "../pages/Auth/VerifyEmail";
import Basket from "../pages/Client/Basket";
import CourseDetails from "../pages/Client/CourseDetails";
import Courses from "../pages/Client/Courses";
import Favorites from "../pages/Client/Favorites";
import Home from "../pages/Client/Home";
import Profile from "../pages/Client/Profile";
import PublicRoute from "./PublicRoute";

const ROUTES = [
  //client routes
  {
    path: "/",
    element: <ClientLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "favorites",
        element: <Favorites />,
      },
      {
        path: "basket",
        element: <Basket />,
      },
      {
        path: "courses",
        element: <Courses />,
      },
      {
        path: "courses/:courseId",
        element: <CourseDetails />,
      },
    ],
  },
  //auth routes
  {
    path: "/auth",
    element: <PublicRoute />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      // {
      //   path: "check-email",
      //   element: <CheckEmail />,
      // },
      {
        path: "verify-email",
        element: <VerifyEmail />,
      },
      {
        path: "reset-password/:token",
        element: <ResetPassword />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      // {
      //   path: "success/:token",
      //   element: <AuthCallback />,
      // },
    ],
  },
  //instructor routes
  //admin routes
];

export default ROUTES;
