let triggered = false;

export const triggerUnauthorized = () => {
  if (triggered) return;

  triggered = true;
  window.dispatchEvent(new Event("unauthorized"));
};
