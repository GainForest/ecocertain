export const tryCatch = async <T>(
  fn: () => Promise<T>
): Promise<[T, null] | [null, Error]> => {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    return [null, error as Error];
  }
};
