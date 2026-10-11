import 'server-only';

import { NextResponse } from 'next/server';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: unknown,
  ) {
    super(message);
  }
}

export function jsonError(status: number, message: string, errors?: unknown) {
  return NextResponse.json(
    errors === undefined ? { message } : { message, errors },
    { status },
  );
}

export function jsonOk<T>(body: T, status = 200) {
  return NextResponse.json(body, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof HttpError) {
    return jsonError(error.status, error.message, error.errors);
  }
  console.error(error);
  return jsonError(500, 'No pudimos completar la solicitud.');
}
