import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import FeedbackForm from "./pages/FeedbackForm";
import InitiatePerformanceCycle from "./pages/InitiatePerformanceCycle";
import ReviewPerformanceData from "./pages/ReviewPerformanceData";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import HRLeadLayout from "./components/layout/HRLeadLayout";
import GeneralLayout from "./components/layout/GeneralLayout";
import RoleDashboardLayout from "./components/layout/RoleDashboardLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserMaster from "./pages/admin/UserMaster";
import LocationMaster from "./pages/admin/LocationMaster";
import ReviewCycleMaster from "./pages/admin/ReviewCycleMaster";
import MenteeSelectReviewers from "./pages/MenteeSelectReviewers";
import MentorReviewApproval from "./pages/MentorReviewApproval";
import ReviewerFeedback from "./pages/ReviewerFeedback";
import GeneralDashboard from "./pages/GeneralDashboard";
import RoleDashboardIndex from "./pages/RoleDashboardIndex";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              {/* General protected routes */}
              <Route element={<ProtectedRoute />}> 
                <Route path="/feedback" element={<FeedbackForm />} />
              </Route>

              {/* Unified dashboard route with role-based layout and index */}
              <Route element={<ProtectedRoute roles={["HR Lead","Employee","Mentor","People Committee"]} />}> 
                <Route path="/dashboard" element={<RoleDashboardLayout />}>
                  <Route index element={<RoleDashboardIndex />} />
                  {/* HR Lead child routes keep working under same branch */}
                  <Route path="initiate-cycle" element={<InitiatePerformanceCycle />} />
                  <Route path="review-data" element={<ReviewPerformanceData />} />
                  {/* Employee */}
                  <Route path="select-reviewers" element={<MenteeSelectReviewers />} />
                  {/* Mentor */}
                  <Route path="review-approve" element={<MentorReviewApproval />} />
                  {/* Reviewer */}
                  <Route path="feedback" element={<ReviewerFeedback />} />
                </Route>
              </Route>

              {/* Admin routes with sidebar layout */}
              <Route element={<ProtectedRoute roles={["System Administrator"]} />}> 
                <Route path="/admin" element={<AdminLayout />} >
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<UserMaster />} />
                  <Route path="locations" element={<LocationMaster />} />
                  <Route path="review-cycles" element={<ReviewCycleMaster />} />
                </Route>
              </Route>

              <Route path="/" element={<Navigate to="/login" replace />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
