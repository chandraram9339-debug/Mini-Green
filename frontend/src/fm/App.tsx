import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import BalanceDepositScreen from "./figma/balance-deposit/BalanceDepositScreen";
import BalanceReferralScreen from "./figma/balance-referral/BalanceReferralScreen";
import SocialMediaScreen from "./figma/social-media/SocialMediaScreen";
import SupportScreen from "./figma/support/SupportScreen";
import FaqScreen from "./figma/faq/FaqScreen";
import NotificationsScreen from "./figma/notifications/NotificationsScreen";
import SettingsScreen from "./figma/settings/SettingsScreen";
import WithdrawScreen from "./figma/withdraw/WithdrawScreen";
import WithdrawRecipientScreen from "./figma/withdraw/WithdrawRecipientScreen";
import WithdrawAmountScreen from "./figma/withdraw/WithdrawAmountScreen";
import WithdrawConfirmScreen from "./figma/withdraw/WithdrawConfirmScreen";
import WithdrawDoneScreen from "./figma/withdraw/WithdrawDoneScreen";
import TopUpScreen from "./figma/top-up/TopUpScreen";
import BotDetailScreen from "./figma/bot-detail/BotDetailScreen";
import HomeScreen from "./figma/home/HomeScreen";
import SeedCodeScreen from "./figma/seed-code/SeedCodeScreen";
import UserAgreementScreen from "./figma/user-agreement/UserAgreementScreen";
import "./figma/home/homeScreen.css";
import { routes } from "./figma/routes";
import { FmLocaleProvider } from "./i18n/FmLocaleContext";
import { AppSessionProvider } from "./session/AppSessionProvider";
import { SessionBanner } from "./session/SessionBanner";
import { SplashScreen } from "./splash/SplashScreen";
import "./splash/splashScreen.css";

const SPLASH_DURATION_MS = 3500;

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setShowSplash(false), SPLASH_DURATION_MS);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <BrowserRouter>
      <FmLocaleProvider>
        <AppSessionProvider>
          <div className={`app-shell${showSplash ? " app-shell--splash-hidden" : ""}`}>
            <SessionBanner />
            <Routes>
              <Route path="/" element={<Navigate to={routes.bot} replace />} />
              <Route path={routes.home} element={<HomeScreen />} />
              <Route path={routes.balanceDeposit} element={<BalanceDepositScreen />} />
              <Route path={routes.balanceReferral} element={<BalanceReferralScreen />} />
              <Route path={routes.bot} element={<BotDetailScreen />} />
              <Route path={routes.social} element={<SocialMediaScreen />} />
              <Route path={routes.support} element={<SupportScreen />} />
              <Route path={routes.faq} element={<FaqScreen />} />
              <Route path={routes.notifications} element={<NotificationsScreen />} />
              <Route path={routes.settings} element={<SettingsScreen />} />
              <Route path={routes.withdraw} element={<WithdrawScreen />} />
              <Route path={routes.withdrawConfirm} element={<WithdrawConfirmScreen />} />
              <Route path={routes.withdrawDone} element={<WithdrawDoneScreen />} />
              <Route path={routes.depositTopUp} element={<TopUpScreen />} />
              <Route path={routes.withdrawRecipient} element={<WithdrawRecipientScreen />} />
              <Route path={routes.withdrawAmount} element={<WithdrawAmountScreen />} />
              <Route path={routes.seedCode} element={<SeedCodeScreen />} />
              <Route path={routes.userAgreement} element={<UserAgreementScreen />} />
            </Routes>
          </div>
          {showSplash ? <SplashScreen durationMs={SPLASH_DURATION_MS} /> : null}
        </AppSessionProvider>
      </FmLocaleProvider>
    </BrowserRouter>
  );
}
