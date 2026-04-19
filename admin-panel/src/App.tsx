import type { ReactElement } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { getAdminKey } from "./api";
import Layout from "./Layout";
import Login from "./pages/Login";
import Stats from "./pages/Stats";
import Deposits from "./pages/Deposits";
import Withdrawals from "./pages/Withdrawals";
import Referral from "./pages/Referral";
import MetaAccounts from "./pages/MetaAccounts";
import Push from "./pages/Push";
import FeesAndWallets from "./pages/FeesAndWallets";
import Content from "./pages/Content";
import User from "./pages/User";
import Integrations from "./pages/Integrations";
import TestTransactions from "./pages/TestTransactions";

function RequireAuth({ children }: { children: ReactElement }) {
  const loc = useLocation();
  if (!getAdminKey()) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Stats />} />
        <Route path="deposits" element={<Deposits />} />
        <Route path="withdrawals" element={<Withdrawals defaultFilter="" />} />
        <Route path="withdrawals-requests" element={<Withdrawals defaultFilter="pending_approval" />} />
        <Route path="referral" element={<Referral />} />
        <Route path="meta" element={<MetaAccounts />} />
        <Route path="push" element={<Push />} />
        <Route path="fees" element={<FeesAndWallets />} />
        <Route path="content" element={<Content />} />
        <Route path="user" element={<User />} />
        <Route path="integrations" element={<Integrations />} />
        <Route path="test-transactions" element={<TestTransactions />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
