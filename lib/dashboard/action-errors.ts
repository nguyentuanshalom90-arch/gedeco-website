export class DashboardValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DashboardValidationError";
  }
}

export function dashboardActionError(error: unknown, fallback: string) {
  return error instanceof DashboardValidationError ? error.message : fallback;
}
