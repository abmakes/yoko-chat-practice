import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConversationsProvider } from "@/contexts/ConversationsContext";
import { StudentIdentityProvider } from "@/contexts/StudentIdentityContext";
import Home from "./pages/Home";
import AddConversation from "./pages/AddConversation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <StudentIdentityProvider>
          <ConversationsProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add" element={<AddConversation />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </ConversationsProvider>
        </StudentIdentityProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
