import { Route, Routes } from "react-router-dom";
import { ProtectedLayout } from "./routes/ProtectedLayout.js";
import CategoriesPage from "./routes/categories.js";
import HomePage from "./routes/home.js";
import ProfilePage from "./routes/profile.js";
import SessionsPage from "./routes/sessions.js";
import SignInPage from "./routes/signin.js";
import SignUpPage from "./routes/signup.js";
import StatsPage from "./routes/stats.js";

export function App() {
  return (
    <Routes>
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route
        path="/*"
        element={
          <ProtectedLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/sessions" element={<SessionsPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </ProtectedLayout>
        }
      />
    </Routes>
  );
}
