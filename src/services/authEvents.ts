let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

export const triggerUnauthorized = () => {
  onUnauthorized?.();
};
