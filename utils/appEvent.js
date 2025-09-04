// utils/appEvents.js
export const APP_EVENTS = {
  APPLICATIONS_UPDATED: "app:applications-updated",
};

export function emitApplicationsUpdated(detail = {}) {
  window.dispatchEvent(new CustomEvent(APP_EVENTS.APPLICATIONS_UPDATED, { detail }));
}
