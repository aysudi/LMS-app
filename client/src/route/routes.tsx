import ClientLayout from "../layout/ClientLayout";
import AuthError from "../pages/Auth/AuthError";
import AuthSuccess from "../pages/Auth/AuthSuccess";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ResetPassword from "../pages/Auth/ResetPassword";
import VerifyEmail from "../pages/Auth/VerifyEmail";
import About from "../pages/Client/About";
import Basket from "../pages/Client/Basket";
import Contact from "../pages/Client/Contact";
import CourseDetails from "../pages/Client/CourseDetails";
import Courses from "../pages/Client/Courses";
import Favorites from "../pages/Client/Favorites";
import Home from "../pages/Client/Home";
import Profile from "../pages/Client/Profile";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";

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
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "favorites",
        element: (
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        ),
      },
      {
        path: "basket",
        element: (
          <ProtectedRoute>
            <Basket />
          </ProtectedRoute>
        ),
      },
      {
        path: "courses",
        element: <Courses />,
      },
      {
        path: "courses/:courseId",
        element: <CourseDetails />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "contact",
        element: <Contact />,
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
        path: "reset-password",
        element: <ResetPassword />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "success/:accessToken",
        element: <AuthSuccess />,
      },
      {
        path: "error",
        element: <AuthError />,
      },
    ],
  },
  //instructor routes
  //admin routes
];

export default ROUTES;
