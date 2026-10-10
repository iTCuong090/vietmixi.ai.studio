export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function notFound(): never {
  throw new HttpError(404, "Không tìm thấy nội dung này.", "NOT_FOUND");
}
