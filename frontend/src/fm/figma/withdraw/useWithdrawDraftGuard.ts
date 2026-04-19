import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { routes } from "../routes";
import { readWithdrawDraft } from "./withdrawDraft";

/** Редирект на старт вывода, если черновика нет (обновили страницу по прямой ссылке). */
export function useWithdrawDraftGuard(): void {
  const navigate = useNavigate();
  useEffect(() => {
    if (!readWithdrawDraft()) navigate(routes.withdraw, { replace: true });
  }, [navigate]);
}
