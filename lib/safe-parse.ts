export const safeParse = <T = undefined>(
  stringifiedJSON: string,
  fallback?: T
) => {
  try {
    return JSON.parse(stringifiedJSON);
  } catch (e) {
    console.error("Error parsing JSON:", e, "\nStringfied:", stringifiedJSON);
    return fallback;
  }
};
