import "../home/homeScreen.css";
import "./faqScreen.css";

import { Fragment, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { FigmaAppBar } from "../components/FigmaAppBar";
import { FigmaStatusBar } from "../components/FigmaStatusBar";
import { FigmaTabBar } from "../components/FigmaTabBar";
import type { StatusBarAssetUrls } from "../types/statusBarAssets";
import type { TabBarIconUrls } from "../types/tabBarIcons";
import { useFmLocale } from "../../i18n/useFmLocale";
import type { MessageKey } from "../../i18n/messages";
import { defaultAppBarAssetUrls } from "../assets/appBarShared";
import { routes } from "../routes";
import { faqAssets } from "./faqAssets";

const faqStatusAssets: StatusBarAssetUrls = {
  networkSignalLight: faqAssets.networkSignalLight,
  wifiSignalLight: faqAssets.wifiSignalLight,
  batteryLight: faqAssets.batteryLight,
  indicator: faqAssets.indicator,
  time941: faqAssets.time941,
};

const faqTabIcons: TabBarIconUrls = {
  home: faqAssets.tabHome,
  wallet: faqAssets.tabWallet,
  bot: faqAssets.tabBot,
  support: faqAssets.tabSupport,
};

type FaqItem = { id: string; title: string; body: ReactNode };

type TF = (key: MessageKey, vars?: Record<string, string | number>) => string;

function buildFaqSections(t: TF): { id: string; heading: string; items: FaqItem[] }[] {
  return [
    {
      id: "balance",
      heading: t("faq.sectionBalance"),
      items: [
        {
          id: "withdraw",
          title: t("faq.q.withdraw"),
          body: (
            <>
              <p>{t("faq.a.withdraw.p1")}</p>
              <p>{t("faq.a.withdraw.p2")}</p>
              <p>{t("faq.a.withdraw.p3")}</p>
              <p className="fm-faq-answer-lead">
                {t("faq.a.withdraw.attentionBefore")}
                <span className="fm-faq-accent">{t("faq.walletTypeTrc20")}</span>
                {t("faq.a.withdraw.attentionAfter")}
              </p>
              <p className="fm-faq-answer-lead">
                {t("faq.a.withdraw.minimumBefore")}
                <span className="fm-faq-accent">{t("faq.a.withdraw.minimumAmount")}</span>
                {t("faq.a.withdraw.minimumAfter")}
              </p>
            </>
          ),
        },
        {
          id: "deposit",
          title: t("faq.q.deposit"),
          body: <p>{t("faq.a.deposit")}</p>,
        },
      ],
    },
    {
      id: "trading",
      heading: t("faq.sectionTrading"),
      items: [
        {
          id: "bot",
          title: t("faq.q.howBot"),
          body: <p>{t("faq.a.howBot")}</p>,
        },
        {
          id: "fees",
          title: t("faq.q.fees"),
          body: <p>{t("faq.a.fees")}</p>,
        },
      ],
    },
    {
      id: "more",
      heading: t("faq.sectionMore"),
      items: [
        {
          id: "referral",
          title: t("faq.q.referral"),
          body: <p>{t("faq.a.referral")}</p>,
        },
        {
          id: "security",
          title: t("faq.q.security"),
          body: <p>{t("faq.a.security")}</p>,
        },
      ],
    },
  ];
}

function FaqChevron({ expanded }: { expanded: boolean }) {
  return (
    <span className="fm-faq-chevron-wrap">
      <span className={`fm-faq-chevron-btn${expanded ? " fm-faq-chevron-btn--open" : ""}`}>
        <img alt="" src={faqAssets.rowChevron} />
      </span>
    </span>
  );
}

function FaqMintChevron() {
  return (
    <span className="fm-faq-chevron-wrap">
      <span className="fm-faq-mint-btn" aria-hidden="true">
        <img alt="" src={faqAssets.rowMint} />
      </span>
    </span>
  );
}

/** Экран «1| FAQ» — node 1:3758: разделы → вопросы. */
export default function FaqScreen() {
  const { t } = useFmLocale();
  const [openId, setOpenId] = useState<string>("withdraw");

  const faqSections = useMemo(() => buildFaqSections(t), [t]);

  return (
    <main className="fm-faq" data-node-id="1:3758" aria-label={t("faq.title")}>
      <FigmaStatusBar assets={faqStatusAssets} />

      <FigmaAppBar assets={defaultAppBarAssetUrls} backTo={routes.support} title={t("faq.title")} />

      <div className="fm-abs fm-faq-list">
        {faqSections.map((section) => (
          <Fragment key={section.id}>
            <h2 className="fm-faq-section-heading">{section.heading}</h2>
            {section.items.map((item) => {
              const expanded = openId === item.id;
              return (
                <article
                  key={item.id}
                  className={expanded ? "fm-faq-row fm-faq-row--expanded" : "fm-faq-row fm-faq-row--collapsed"}
                >
                  {expanded ? (
                    <>
                      <div className="fm-faq-expand-top">
                        <button
                          type="button"
                          className="fm-faq-row-hit"
                          aria-expanded={true}
                          onClick={() => setOpenId("")}
                        >
                          <p className="fm-faq-row-title fm-faq-row-title--expanded">{item.title}</p>
                          <FaqMintChevron />
                        </button>
                      </div>
                      <div className="fm-faq-answer">{item.body}</div>
                    </>
                  ) : (
                    <button type="button" className="fm-faq-row-hit" aria-expanded={false} onClick={() => setOpenId(item.id)}>
                      <p className="fm-faq-row-title">{item.title}</p>
                      <FaqChevron expanded={false} />
                    </button>
                  )}
                </article>
              );
            })}
          </Fragment>
        ))}
      </div>

      <FigmaTabBar icons={faqTabIcons} />
    </main>
  );
}
