import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PropertyProvider } from "./context/PropertyContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import PublicLayout from "./layouts/PublicLayout";
import Home from "./pages/Home";
import BrowseProperties from "./pages/BrowseProperties";
import PropertyDetails from "./pages/PropertyDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import ProfilePage from "./dashboards/ProfilePage";
import ClientLayout from "./dashboards/client/ClientLayout";
import ClientOverview from "./dashboards/client/ClientOverview";
import ClientFavorites from "./dashboards/client/ClientFavorites";
import ClientSearches from "./dashboards/client/ClientSearches";
import ClientRequests from "./dashboards/client/ClientRequests";
import OwnerLayout from "./dashboards/owner/OwnerLayout";
import OwnerOverview from "./dashboards/owner/OwnerOverview";
import OwnerProperties from "./dashboards/owner/OwnerProperties";
import OwnerPropertyEditor from "./dashboards/owner/OwnerPropertyEditor";
import OwnerRequests from "./dashboards/owner/OwnerRequests";
import AdminLayout from "./dashboards/admin/AdminLayout";
import AdminOverview from "./dashboards/admin/AdminOverview";
import AdminUsers from "./dashboards/admin/AdminUsers";
import AdminProperties from "./dashboards/admin/AdminProperties";
import AdminVerification from "./dashboards/admin/AdminVerification";
import AdminReports from "./dashboards/admin/AdminReports";
import AdminProfile from "./dashboards/admin/AdminProfile";
import { ROLES } from "./data/options";

function DashboardRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? ROLES[user.role].home : "/login"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <PropertyProvider>
            <ScrollToTop />
            <Routes>
              <Route element={<PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="properties" element={<BrowseProperties />} />
                <Route path="properties/:id" element={<PropertyDetails />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="dashboard" element={<DashboardRedirect />} />

              <Route path="client" element={<ProtectedRoute roles={["client"]}><ClientLayout /></ProtectedRoute>}>
                <Route index element={<ClientOverview />} />
                <Route path="favorites" element={<ClientFavorites />} />
                <Route path="searches" element={<ClientSearches />} />
                <Route path="visits" element={<ClientRequests key="visit" kind="visit" />} />
                <Route path="contacts" element={<ClientRequests key="contact" kind="contact" />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              <Route path="owner" element={<ProtectedRoute roles={["owner"]}><OwnerLayout /></ProtectedRoute>}>
                <Route index element={<OwnerOverview />} />
                <Route path="properties" element={<OwnerProperties />} />
                <Route path="properties/new" element={<OwnerPropertyEditor />} />
                <Route path="properties/:id/edit" element={<OwnerPropertyEditor />} />
                <Route path="visits" element={<OwnerRequests key="visit" kind="visit" />} />
                <Route path="contacts" element={<OwnerRequests key="contact" kind="contact" />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              <Route path="admin" element={<ProtectedRoute roles={["admin"]}><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="properties" element={<AdminProperties />} />
                <Route path="verification" element={<AdminVerification />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </PropertyProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
