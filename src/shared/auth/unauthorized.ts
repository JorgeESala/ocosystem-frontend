export const triggerUnauthorized = () => {
  window.dispatchEvent(new Event("unauthorized"));
};
