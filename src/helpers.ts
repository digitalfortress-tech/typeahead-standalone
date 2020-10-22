export const NOOP = (...args: unknown[]): void => undefined;

export const escapeRegExp = (text: string) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
