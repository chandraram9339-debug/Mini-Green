/**
 * Utility components for marking required / important fields in the admin panel.
 */

/** Red badge shown when a required field is empty or has a known insecure default value. */
export function RequiredBadge({ value, defaultValues }: { value: string; defaultValues?: string[] }) {
  const isEmpty = !value || value.trim() === "";
  const isDefault = defaultValues?.some((d) => value.trim() === d.trim());
  if (!isEmpty && !isDefault) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        background: "#fee2e2",
        color: "#dc2626",
        border: "1px solid #fca5a5",
        borderRadius: 4,
        padding: "2px 7px",
        fontSize: 12,
        fontWeight: 600,
        marginLeft: 8,
        verticalAlign: "middle",
        whiteSpace: "nowrap",
      }}
    >
      🔴 {isEmpty ? "Не заполнено" : "Небезопасное значение"}
    </span>
  );
}

/** Green badge shown when field is filled correctly. */
export function OkBadge({ value, defaultValues }: { value: string; defaultValues?: string[] }) {
  const isEmpty = !value || value.trim() === "";
  const isDefault = defaultValues?.some((d) => value.trim() === d.trim());
  if (isEmpty || isDefault) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        background: "#dcfce7",
        color: "#16a34a",
        border: "1px solid #86efac",
        borderRadius: 4,
        padding: "2px 7px",
        fontSize: 12,
        fontWeight: 600,
        marginLeft: 8,
        verticalAlign: "middle",
        whiteSpace: "nowrap",
      }}
    >
      ✅ Заполнено
    </span>
  );
}

/** Helper text shown below a field. */
export function FieldNote({ children, important }: { children: React.ReactNode; important?: boolean }) {
  return (
    <p
      style={{
        margin: "0.3rem 0 0",
        fontSize: 12,
        color: important ? "#dc2626" : "#6b7280",
        lineHeight: 1.5,
      }}
    >
      {children}
    </p>
  );
}
