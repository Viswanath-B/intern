import { useEffect } from "react";
import { BrowserRouter, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { SiteFooter } from "./components/SiteFooter";
import { InternshipApplicationPage } from "./pages/InternshipApplicationPage";
import { LandingPage } from "./pages/LandingPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ScannerPage } from "./pages/ScannerPage";

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return null;
}

function Shell() {
  return (
    <>
      <ScrollToTop />
      
      <Outlet />
      <SiteFooter />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/apply/short-term" element={<InternshipApplicationPage internshipType="short" />} />
          <Route path="/apply/long-term" element={<InternshipApplicationPage internshipType="long" />} />
          <Route path="/scanner" element={<ScannerPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
