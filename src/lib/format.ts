import { format, startOfWeek, addDays } from "date-fns";
import { fr } from "date-fns/locale";

export function formatMoney(cents: number | string | null | undefined) {
  const value = Number(cents ?? 0) / 100;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR"
  }).format(value);
}

export function formatDateFr(value: Date | string | null | undefined) {
  if (!value) return "Non renseigne";
  return new Intl.DateTimeFormat("fr-FR").format(new Date(value));
}

export function formatDateTimeFr(value: Date | string | null | undefined) {
  if (!value) return "A planifier";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function formatPhone(value: string | null | undefined) {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 10) return value;
  return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}

export function weekDays(anchor = new Date()) {
  const monday = startOfWeek(anchor, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

export function dayLabel(value: Date) {
  return format(value, "EEE dd/MM", { locale: fr }).replace(".", "");
}

export function isoDate(value = new Date()) {
  return value.toISOString().slice(0, 10);
}

export function toDateInputValue(value: Date | string | null | undefined) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function toDateTimeInputValue(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}
