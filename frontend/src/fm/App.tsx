import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import BalanceDepositScreenNew from "./figma/balance-deposit/BalanceDepositScreenNew";
import BalanceReferralScreen from "./figma/balance-referral/BalanceReferralScreen";
import SocialMediaScreen from "./figma/social-media/SocialMediaScreen";
import SupportScreenNew from "./figma/support/SupportScreenNew";
import FaqScreenNew from "./figma/faq/FaqScreenNew";
import NotificationsScreenNew from "./figma/notifications/NotificationsScreenNew";
import SettingsScreenNew from "./figma/settings/SettingsScreenNew";
import WithdrawScreen from "./figma/withdraw/WithdrawScreenNew";
import WithdrawRecipientScreen from "./figma/withdraw/WithdrawRecipientScreenNew";
import WithdrawAmountScreen from "./figma/withdraw/WithdrawAmountScreenNew";
import WithdrawConfirmScreen from "./figma/withdraw/WithdrawConfirmScreenNew";
import WithdrawDoneScreen from "./figma/withdraw/WithdrawDoneScreenNew";
import TopUpScreenNew from "./figma/top-up/TopUpScreenNew";
import BotDetailScreenNew from "./figma/bot-detail/BotDetailScreenNew";
import HomeScreenNew from "./figma/home/HomeScreenNew";
import SeedCodeScreen from "./figma/seed-code/SeedCodeScreenNew";
import UserAgreementScreen from "./figma/user-agreement/UserAgreementScreenNew";
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
              <Route path="/" element={<Navigate to={routes.home} replace />} />
              <Route path={routes.home} element={<HomeScreenNew />} />
              <Route path={routes.balanceDeposit} element={<BalanceDepositScreenNew />} />
              <Route path={routes.balanceReferral} element={<BalanceReferralScreen />} />
              <Route path={routes.bot} element={<BotDetailScreenNew />} />
              <Route path={routes.social} element={<SocialMediaScreen />} />
              <Route path={routes.support} element={<SupportScreenNew />} />
              <Route path={routes.faq} element={<FaqScreenNew />} />
              <Route path={routes.notifications} element={<NotificationsScreenNew />} />
              <Route path={routes.settings} element={<SettingsScreenNew />} />
              <Route path={routes.withdraw} element={<WithdrawScreen />} />
              <Route path={routes.withdrawConfirm} element={<WithdrawConfirmScreen />} />
              <Route path={routes.withdrawDone} element={<WithdrawDoneScreen />} />
              <Route path={routes.depositTopUp} element={<TopUpScreenNew />} />
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
