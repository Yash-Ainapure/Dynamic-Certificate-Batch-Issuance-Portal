export const ok = <T>(data: T) => ({ success: true, data });
export const fail = (message: string) => ({ success: false, message });
