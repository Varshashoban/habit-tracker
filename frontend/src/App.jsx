import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";

import SiteNavbar from "./components/navigation/SiteNavbar";
import AuthLoading from "./features/auth/components/AuthLoading";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import PublicOnlyRoute from "./features/auth/components/PublicOnlyRoute";
import LoginPage from "./features/auth/pages/LoginPage";
import SignupPage from "./features/auth/pages/SignupPage";
import FeaturesSection from "./features/marketing/components/FeaturesSection";
import HeroSection from "./features/marketing/components/HeroSection";

const DashboardPage = lazy(() => import("./features/dashboard/pages/DashboardPage"));

function LandingPage() {
  return (
    <>
      <SiteNavbar />
      <main>
        <HeroSection />
        <FeaturesSection />
      </main>
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#070a0e] text-white">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard/*"
            element={
              <Suspense fallback={<AuthLoading />}>
                <DashboardPage />
              </Suspense>
            }
          />
        </Route>
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
