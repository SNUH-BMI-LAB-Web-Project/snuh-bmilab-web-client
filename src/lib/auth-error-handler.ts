let hasHandled401 = false;

export const handleUnauthorizedOnce = () => {
  if (hasHandled401) return false;
  hasHandled401 = true;

  setTimeout(() => {
    hasHandled401 = false;
  }, 5000); // 5초 동안 재차 발생한 401 무시

  return true;
};
