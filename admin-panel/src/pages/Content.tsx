import { FormEvent, useEffect, useState } from "react";
import { apiJson } from "../api";
import type { ContentPayload } from "../types";

export default function Content() {
  const [c, setC] = useState<ContentPayload | null>(null);
  const [channelUrl, setChannelUrl] = useState("");
  const [chatUrl, setChatUrl] = useState("");
  const [supportUrl, setSupportUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [publicBotUsername, setPublicBotUsername] = useState("");
  const [miniappWebappUrl, setMiniappWebappUrl] = useState("");
  const [faq, setFaq] = useState("");
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
        setFaq(x.faq_markdown);
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
          faq_markdown: faq,
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
            <label htmlFor="ch">Ссылка на канал</label>
            <input id="ch" value={channelUrl} onChange={(e) => setChannelUrl(e.target.value)} />
          </div>
          <div className="row">
            <label htmlFor="chat">Ссылка на чат</label>
            <input id="chat" value={chatUrl} onChange={(e) => setChatUrl(e.target.value)} />
          </div>
          <div className="row">
            <label htmlFor="sup">Поддержка</label>
            <input id="sup" value={supportUrl} onChange={(e) => setSupportUrl(e.target.value)} />
          </div>
          <div className="row">
            <label htmlFor="yt">YouTube / видео (ссылка для мини-аппа)</label>
            <input id="yt" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
          </div>
          <div className="row">
            <label htmlFor="botu">Имя Telegram-бота (без @, для реф-ссылок t.me/…)</label>
            <input
              id="botu"
              value={publicBotUsername}
              onChange={(e) => setPublicBotUsername(e.target.value)}
              placeholder="MyProjectBot"
            />
          </div>
          <div className="row">
            <label htmlFor="mapp">Ссылка для запуска мини-аппа (Web App)</label>
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
            <label htmlFor="faq">Частые вопросы (Markdown)</label>
            <textarea id="faq" value={faq} onChange={(e) => setFaq(e.target.value)} style={{ minHeight: 200 }} />
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
