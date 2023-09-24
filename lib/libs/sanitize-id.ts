export const sanitizeId = (src: string): string =>
  src.replace(/[^A-Z0-9]/gi, "-");
