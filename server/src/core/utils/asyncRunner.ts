export function runInBackground(task: () => Promise<any> | any, label?: string) {
  setImmediate(async () => {
    try {
      await task();
    } catch (err) {
      // Best-effort logging; do not crash the process
      const tag = label ? `[bg:${label}]` : '[bg]';
      console.error(`${tag} Task failed:`, err);
    }
  });
}
