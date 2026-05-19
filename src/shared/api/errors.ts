import type { ApiError, ApiErrorCode } from '@shared/types/domain';

export class MockApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'MockApiError';
    this.code = error.code;
    this.status = error.status;
  }
}

export const toApiError = (error: unknown): ApiError => {
  if (error instanceof MockApiError) {
    return { code: error.code, message: error.message, status: error.status };
  }
  if (error instanceof Error) return { code: 'UNKNOWN', message: error.message, status: 500 };
  return { code: 'UNKNOWN', message: 'Unknown API error', status: 500 };
};

export const apiError = (code: ApiErrorCode, message: string, status: number): MockApiError =>
  new MockApiError({ code, message, status });
