export const getSafeStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error parsing localStorage key "${key}":`, error);
    // If parsing fails, clean it up to prevent crash loops
    localStorage.removeItem(key);
    return defaultValue;
  }
};

export const setSafeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error stringifying localStorage key "${key}":`, error);
  }
};
