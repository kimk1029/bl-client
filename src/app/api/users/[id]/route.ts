import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getAccessToken, buildAuthHeaders } from '@/lib/authServer';
import { createApiUrl } from '@/utils/apiConfig';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const accessToken = getAccessToken(session);
    if (!accessToken) {
      return NextResponse.json({ error: '액세스 토큰을 찾을 수 없습니다.' }, { status: 401 });
    }

    console.log('Fetching user data for ID:', id, 'with token:', accessToken ? 'present' : 'missing');

    // 백엔드에서 사용자 정보 가져오기
    const backendUrl = createApiUrl(`/users/${id}`);
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: buildAuthHeaders(accessToken),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', response.status, errorText);
      return NextResponse.json(
        { 
          error: '사용자 정보를 불러오는데 실패했습니다.', 
          status: response.status, 
          message: errorText 
        }, 
        { status: response.status }
      );
    }

    const userData = await response.json();
    console.log('User data from backend:', userData);

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
