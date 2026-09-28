export class ZaadError extends Error {
  constructor(code, message, cause = null) {
    super(message);
    this.name = 'ZaadError';
    this.code = code;
    this.cause = cause;
  }
}

export function safeErrorMessage(error, fallback = 'حدث خطأ غير متوقع') {
  if (error instanceof ZaadError) return error.message;
  return fallback;
}
