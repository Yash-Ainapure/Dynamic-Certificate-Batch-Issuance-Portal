export function buildApiUrl(path: string) {
  const base = (import.meta as any).env?.VITE_API_URL as string | undefined;
  if (!base) return path.startsWith('/') ? path : `/${path}`;
  const sep = path.startsWith('/') ? '' : '/';
  return `${base}${sep}${path}`;
}

export function buildVerifyUrl(certId: string) {
  return buildApiUrl(`/verify/${certId}`);
}
