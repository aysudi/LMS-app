import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider } from "notistack";
import ROUTES from "./route/routes";
import { queryClient } from "./utils/queryClient";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/UI/ToastProvider";

const router = createBrowserRouter(ROUTES);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <SnackbarProvider
            maxSnack={3}
            dense={false}
            autoHideDuration={5000}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            preventDuplicate
          >
            <RouterProvider router={router} />
          </SnackbarProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
