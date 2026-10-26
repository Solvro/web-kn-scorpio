const dayMonth = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
  timeZone: "Europe/Warsaw",
});

/** "2 listopada", with a non-breaking space so the day never wraps alone. */
export function formatDeadline(deadline: string) {
  return dayMonth.format(new Date(deadline)).replace(" ", " ");
}

export function isRecruitmentOpen(deadline: string, now = Date.now()) {
  return new Date(deadline).getTime() > now;
}
