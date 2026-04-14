import { NextRequest, NextResponse } from 'next/server';
import { buildAuthHeaders } from '@/lib/authServer';
import { createApiUrl } from '@/utils/apiConfig';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const headers = await buildAuthHeaders();
    const upstream = await fetch(createApiUrl(`/affiliations/${id}`), { headers });
    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      return NextResponse.json({ message: text || '상세 조회 실패' }, { status: upstream.status });
    }
    const data = await upstream.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ message: '서버 오류' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const headers = await buildAuthHeaders();
    const upstream = await fetch(createApiUrl(`/affiliations/${id}`), {
      method: 'PUT',
      headers,
      body: formData,
    });
    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      return NextResponse.json({ message: text || '수정 실패' }, { status: upstream.status });
    }
    const data = await upstream.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ message: '서버 오류' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const headers = await buildAuthHeaders();
    const upstream = await fetch(createApiUrl(`/affiliations/${id}`), {
      method: 'DELETE',
      headers,
    });
    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      return NextResponse.json({ message: text || '삭제 실패' }, { status: upstream.status });
    }
    return NextResponse.json({});
  } catch (e) {
    return NextResponse.json({ message: '서버 오류' }, { status: 500 });
  }
}
