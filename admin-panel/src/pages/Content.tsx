import { FormEvent, useEffect, useState } from "react";
import { apiJson } from "../api";
import type { ContentPayload } from "../types";
import { FieldNote, OkBadge, RequiredBadge } from "../components/FieldHint";

export default function Content() {
  const [c, setC] = useState<ContentPayload | null>(null);
  const [channelUrl, setChannelUrl] = useState("");
  const [chatUrl, setChatUrl] = useState("");
  const [supportUrl, setSupportUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [publicBotUsername, setPublicBotUsername] = useState("");
  const [miniappWebappUrl, setMiniappWebappUrl] = useState("");
  const [telegramWelcomeText, setTelegramWelcomeText] = useState("");
  const [faq, setFaq] = useState("");
  const [faqEs, setFaqEs] = useState("");
  const [userAgreement, setUserAgreement] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    apiJson<ContentPayload>("/admin/content")
      .then((x) => {
        setC(x);
        setChannelUrl(x.channel_url);
        setChatUrl(x.chat_url);
        setSupportUrl(x.support_url);
        setYoutubeUrl(x.youtube_url ?? "");
        setPublicBotUsername(x.public_telegram_bot_username ?? "");
        setMiniappWebappUrl(x.miniapp_webapp_url ?? "");
        setTelegramWelcomeText(x.telegram_welcome_text ?? "");
        setFaq(x.faq_markdown);
        setFaqEs(x.faq_markdown_es ?? "");
        setUserAgreement(x.user_agreement_markdown ?? "");
      })
      .catch((e: Error) => setErr(e.message));
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    try {
      const r = await apiJson<ContentPayload>("/admin/content", {
        method: "PATCH",
        body: JSON.stringify({
          channel_url: channelUrl,
          chat_url: chatUrl,
          support_url: supportUrl,
          youtube_url: youtubeUrl,
          public_telegram_bot_username: publicBotUsername,
          miniapp_webapp_url: miniappWebappUrl,
          telegram_welcome_text: telegramWelcomeText,
          faq_markdown: faq,
          faq_markdown_es: faqEs,
          user_agreement_markdown: userAgreement
        })
      });
      setC(r);
      setMsg("Сохранено");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <>
      <h2>Контент (канал, чат, поддержка, FAQ)</h2>
      {err ? <div className="err">{err}</div> : null}
      {msg ? <div className="ok">{msg}</div> : null}

      <div className="card">
        <form onSubmit={save}>
          <div className="row">
            <label htmlFor="ch">
              Ссылка на канал
              <RequiredBadge value={channelUrl} />
              <OkBadge value={channelUrl} />
            </label>
            <input id="ch" value={channelUrl} onChange={(e) => setChannelUrl(e.target.value)} placeholder="https://t.me/yourchannel" />
            <FieldNote>Ссылка на канал. Кнопка «Channel» внизу главного экрана и кнопка в приветствии /start.</FieldNote>
          </div>
          <div className="row">
            <label htmlFor="chat">
              Ссылка на чат
              <RequiredBadge value={chatUrl} />
              <OkBadge value={chatUrl} />
            </label>
            <input id="chat" value={chatUrl} onChange={(e) => setChatUrl(e.target.value)} placeholder="https://t.me/yourchat" />
            <FieldNote important={!chatUrl}>
              🔴 Кнопка «Chat» внизу главного экрана открывает эту ссылку.
            </FieldNote>
          </div>
          <div className="row">
            <label htmlFor="sup">
              Поддержка
              <RequiredBadge value={supportUrl} />
              <OkBadge value={supportUrl} />
            </label>
            <input id="sup" value={supportUrl} onChange={(e) => setSupportUrl(e.target.value)} placeholder="https://t.me/yoursupport" />
            <FieldNote important={!supportUrl}>
              🔴 Обязательно — ссылка открывается при нажатии «Support Chat» на экране поддержки.
            </FieldNote>
          </div>
          <div className="row">
            <label htmlFor="yt">YouTube / видео (ссылка для мини-аппа)</label>
            <input id="yt" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/..." />
            <FieldNote>Необязательно. Ссылка на обучающее видео или канал YouTube.</FieldNote>
          </div>
          <div className="row">
            <label htmlFor="botu">
              Имя Telegram-бота (без @, для реф-ссылок t.me/…)
              <RequiredBadge value={publicBotUsername} />
              <OkBadge value={publicBotUsername} />
            </label>
            <input
              id="botu"
              value={publicBotUsername}
              onChange={(e) => setPublicBotUsername(e.target.value)}
              placeholder="MyProjectBot"
            />
            <FieldNote important={!publicBotUsername}>
              🔴 Обязательно — username бота без @. Используется для генерации персональных реферальных ссылок
              вида <code>t.me/MyProjectBot?start=ref12345</code>. Без этого реферальные ссылки не работают.
            </FieldNote>
          </div>
          <div className="row">
            <label htmlFor="mapp">
              Ссылка для запуска мини-аппа (Web App)
              <RequiredBadge value={miniappWebappUrl} />
              <OkBadge value={miniappWebappUrl} />
            </label>
            <input
              id="mapp"
              value={miniappWebappUrl}
              onChange={(e) => setMiniappWebappUrl(e.target.value)}
              placeholder="https://t.me/MyProjectBot/myMiniApp"
            />
            <p className="muted" style={{ margin: "0.35rem 0 0", fontSize: 13 }}>
              Из @BotFather: Bot → Bot Settings → Menu Button / Mini App → скопируйте ссылку вида{" "}
              <code>t.me/…</code>. Нужна для кнопки ниже и для проверки интеграций.
            </p>
            <div style={{ marginTop: "0.5rem" }}>
              <button
                type="button"
                className="btn"
                disabled={!miniappWebappUrl.trim()}
                onClick={() => {
                  const u = miniappWebappUrl.trim();
                  if (!u) return;
                  window.open(u, "_blank", "noopener,noreferrer");
                }}
              >
                Открыть мини-апп в новой вкладке
              </button>
            </div>
          </div>
          <div className="row">
            <label htmlFor="tgwelcome">Текст приветствия в Telegram (/start)</label>
            <textarea
              id="tgwelcome"
              value={telegramWelcomeText}
              onChange={(e) => setTelegramWelcomeText(e.target.value)}
              style={{ minHeight: 120 }}
              placeholder="Оставьте пустым для дефолта (PALLADIUM welcome + кнопки), или вставьте свой plain text. Кнопки App / Channel / Chat — по ссылкам из полей выше."
            />
            <FieldNote>
              Отправляется после /start. Если пусто — английский текст по умолчанию (Welcome to PALLADIUM AI + кнопки App /
              Channel / Chat). Техподсказки при незаполненных ссылках дописываются автоматически.
            </FieldNote>
          </div>
          <div className="row">
            <label htmlFor="faq">Частые вопросы (Markdown, EN / default)</label>
            <textarea id="faq" value={faq} onChange={(e) => setFaq(e.target.value)} style={{ minHeight: 200 }} />
          </div>
          <div className="row">
            <label htmlFor="faqEs">Частые вопросы (Markdown, ES)</label>
            <textarea
              id="faqEs"
              value={faqEs}
              onChange={(e) => setFaqEs(e.target.value)}
              style={{ minHeight: 200 }}
              placeholder="Пусто — в мини-аппе на испанском показывается встроенный FAQ.es.md из репозитория"
            />
            <FieldNote>
              При языке «Español» в мини-аппе используется это поле; если пусто — бандл из репо (`FAQ.es.md`).
            </FieldNote>
          </div>
          <div className="row">
            <label htmlFor="ua">Пользовательское соглашение (Markdown, мини-апп)</label>
            <textarea
              id="ua"
              value={userAgreement}
              onChange={(e) => setUserAgreement(e.target.value)}
              style={{ minHeight: 160 }}
              placeholder="Пусто — в приложении показывается текст по умолчанию"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Сохранить
          </button>
        </form>
        {c ? (
          <p className="muted" style={{ marginTop: "1rem" }}>
            Текущие значения на сервере загружены; после сохранения они совпадают с формой.
          </p>
        ) : null}
      </div>
    </>
  );
}
