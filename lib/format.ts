export function formatDate(date: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}
