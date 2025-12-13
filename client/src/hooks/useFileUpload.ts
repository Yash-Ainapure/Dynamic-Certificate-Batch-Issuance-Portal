export function useFileUpload() {
  const upload = async (_file: File) => {
    return { ok: true };
  };
  return { upload };
}
