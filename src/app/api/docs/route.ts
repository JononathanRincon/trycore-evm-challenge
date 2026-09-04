import { NextResponse } from 'next/server';
import { openApiSpec } from '@/infrastructure/docs/openapi.spec';

export async function GET() {
  return NextResponse.json(openApiSpec, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
