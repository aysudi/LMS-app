import ClientLayout from "../layout/ClientLayout";
import StudentLearningLayout from "../layout/StudentLearningLayout";
import InstructorLayout from "../layout/InstructorLayout";
import AuthError from "../pages/Auth/AuthError";
import AuthSuccess from "../pages/Auth/AuthSuccess";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ResetPassword from "../pages/Auth/ResetPassword";
import VerifyEmail from "../pages/Auth/VerifyEmail";
import About from "../pages/Client/About";
import Contact from "../pages/Client/Contact";
import CourseDetails from "../pages/Client/CourseDetails";
import Courses from "../pages/Client/Courses";
import Wishlist from "../pages/Client/Wishlist";
import Home from "../pages/Client/Home";
import Profile from "../pages/Client/Profile";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";
import Cart from "../pages/Client/Cart";
import Checkout from "../pages/Client/Checkout";
import MyLearning from "../pages/Client/MyLearning";
import PaymentSuccess from "../pages/Client/PaymentSuccess";
import CourseWatch from "../pages/Client/CourseWatch";
// Instructor Pages
import InstructorDashboard from "../pages/Instructor/Dashboard";
import InstructorCourses from "../pages/Instructor/Courses";
import InstructorStudents from "../pages/Instructor/Students";
import InstructorAnalytics from "../pages/Instructor/Analytics";
import InstructorMessages from "../pages/Instructor/Messages";
import InstructorEarnings from "../pages/Instructor/Earnings";
import CreateCourse from "../pages/Instructor/CreateCourse";
import EditCourse from "../pages/Instructor/EditCourse";
import LessonEditor from "../pages/Instructor/LessonEditor";
import LessonEditPage from "../pages/Instructor/LessonEditPage";

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
        path: "wishlist",
        element: (
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        ),
      },
      {
        path: "cart",
        element: (
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        ),
      },
      {
        path: "checkout",
        element: (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        ),
      },
      {
        path: "my-learning",
        element: (
          <ProtectedRoute>
            <MyLearning />
          </ProtectedRoute>
        ),
      },
      {
        path: "payment/success",
        element: (
          <ProtectedRoute>
            <PaymentSuccess />
          </ProtectedRoute>
        ),
      },
      {
        path: "courses",
        element: <Courses />,
      },
      {
        path: "course/:courseId",
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
  //student learning routes (no header/footer for focused learning)
  {
    path: "/course",
    element: <StudentLearningLayout />,
    children: [
      {
        path: ":courseId/learn",
        element: (
          <ProtectedRoute>
            <CourseWatch />
          </ProtectedRoute>
        ),
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
  {
    path: "/instructor",
    element: (
      <ProtectedRoute>
        <InstructorLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <InstructorDashboard />,
      },
      {
        path: "courses",
        element: <InstructorCourses />,
      },
      {
        path: "courses/create",
        element: <CreateCourse />,
      },
      {
        path: "courses/:courseId/edit",
        element: <EditCourse />,
      },
      {
        path: "courses/:courseId/lessons/create",
        element: <LessonEditor />,
      },
      {
        path: "courses/:courseId/lessons/:lessonId/edit",
        element: <LessonEditPage />,
      },
      {
        path: "students",
        element: <InstructorStudents />,
      },
      {
        path: "analytics",
        element: <InstructorAnalytics />,
      },
      {
        path: "messages",
        element: <InstructorMessages />,
      },
      {
        path: "earnings",
        element: <InstructorEarnings />,
      },
    ],
  },
  //admin routes
];

export default ROUTES;
