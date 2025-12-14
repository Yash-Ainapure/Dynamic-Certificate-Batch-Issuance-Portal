export const waitForElement = (
  selector: string,
  { timeout = 8000, interval = 100 } = {}
): Promise<Element> => {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);
      if (Date.now() - started >= timeout) return reject(new Error(`Timeout waiting for ${selector}`));
      setTimeout(tick, interval);
    };
    tick();
  });
};
