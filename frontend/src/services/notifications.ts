export const NOTIFICATIONS_CHANGED_EVENT = "ids-notifications-changed";

export function announceNotificationsChanged(): void {
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}
