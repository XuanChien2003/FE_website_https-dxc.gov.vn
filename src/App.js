import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import HomePage from "./pages/home/HomePage";
import NewsDetail from "./pages/home/NewsDetail";
import DocumentsPage from "./pages/home/DocumentsPage";

import LoginPage from "./pages/auth/LoginPage";
import AdminLayout from "./pages/admin/AdminLayout";
import DocumentList from "./pages/admin/document/DocumentList";
import DocumentForm from "./pages/admin/document/DocumentForm";
import AgencyManager from "./pages/admin/document/AgencyManager/AgencyManager";
import SignerManager from "./pages/admin/document/SignerManager/SignerManager";
import FieldManager from "./pages/admin/document/FieldManager/FieldManager";
import TypeManager from "./pages/admin/document/TypeManager/TypeManager";
import NewsManager from "./pages/admin/news/NewsManager";
import CategoryManager from "./pages/admin/news/CategoryManager";
import MenuManager from "./pages/admin/menu/MenuManager";
import NewsForm from "./pages/admin/news/NewsForm";
import SlideManager from "./pages/admin/slide/SlideManager";
import WebLinkManager from "./pages/admin/weblink/WebLinkManager";
import Header from "./components/Header";
import Footer from "./components/Footer";
import UserProfile from "./pages/user/UserProfile";
import DocumentDetail from "./pages/home/DocumentDetail";
import SignInSelection from "./pages/auth/SignInSelection";
import NewsPage from "./pages/home/NewsPage";

const ClientLayout = () => {
  return (
    <div
      className="client-layout"
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header />
      <div className="main-content" style={{ flex: 1 }}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

/* ================= ADMIN ROUTE GUARD ================= */
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <ToastContainer autoClose={2000} position="top-right" />

      <Routes>
        <Route element={<ClientLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="news/:id" element={<NewsDetail />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="/documents/:id" element={<DocumentDetail />} />
        </Route>
        <Route path="/cms" element={<SignInSelection />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="news" replace />} />

          <Route path="documents" element={<DocumentList />} />
          <Route path="documents/add" element={<DocumentForm />} />
          <Route path="documents/edit/:id" element={<DocumentForm />} />

          <Route path="agencies" element={<AgencyManager />} />
          <Route path="signers" element={<SignerManager />} />
          <Route path="fields" element={<FieldManager />} />
          <Route path="types" element={<TypeManager />} />

          <Route path="news" element={<NewsManager />} />
          <Route path="news/add" element={<NewsForm />} />
          <Route path="news/edit/:id" element={<NewsForm />} />

          <Route path="categories" element={<CategoryManager />} />
          <Route path="menus" element={<MenuManager />} />
          <Route path="slides" element={<SlideManager />} />
          <Route path="weblinks" element={<WebLinkManager />} />

          <Route path="profile" element={<UserProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
