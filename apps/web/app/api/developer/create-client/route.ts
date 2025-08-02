import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { createWorkshopClient, WorkshopClientRequest } from '@/lib/management-api';

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body: WorkshopClientRequest = await request.json();
    const { tenantDomain, participantName } = body;

    if (!tenantDomain) {
      return NextResponse.json({ 
        error: 'Tenant domain is required' 
      }, { status: 400 });
    }

    // Create the workshop client
    const result = await createWorkshopClient({
      tenantDomain,
      participantName
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Create client error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to create workshop client',
      success: false
    }, { status: 500 });
  }
}
