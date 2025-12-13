export const IssuanceService = {
  async start(_batchId: string) {
    return { started: true };
  },
  async status(_batchId: string) {
    return { progress: 0 };
  },
};
