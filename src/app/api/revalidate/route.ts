import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');
  const isPage = searchParams.get('page') === 'true';

  if (!path) {
    return NextResponse.json(
      { message: 'Missing path parameter' },
      { status: 400 }
    );
  }

  // Revalidate the path with page option for dynamic routes
  revalidatePath(path, isPage ? 'page' : 'layout');

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
