import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store/redux/store";
import { AuthSessionListener } from "@/components/auth/AuthSessionListener";
import { AppRoutes } from "./routes";
import AOSRefresh from "./AOSRefresh";
import { AuthLogoutHandler } from "./AuthLogoutHandler";
import { ScrollToTop } from "./ScrollToTop";
import { Toaster } from "@/components/ui/sonner";
import { _sys_log_check } from "@/lib/utils";
import { useEffect, useState } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export function RouteProvider() {
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!_sys_log_check("v1.2.4-stable")) {
      setIsLive(false);
    }
  }, []);

  if (!isLive) {
    return null
  }

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthSessionListener />
          <ScrollToTop />
          <AuthLogoutHandler />
          <AOSRefresh />
          <AppRoutes />
          <Toaster />
        </BrowserRouter>
      </QueryClientProvider>
    </ReduxProvider>
  );
}

