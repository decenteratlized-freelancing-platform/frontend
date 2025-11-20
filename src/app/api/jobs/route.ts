// src/app/api/jobs/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * POST /api/jobs
 * Expected payload (example):
 * {
 *   "title": "Job title",


 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // Forward the request to the backend API
        const backendRes = await fetch('http://localhost:5000/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await backendRes.json();
        const status = backendRes.status;
        return NextResponse.json(data, { status });
    } catch (error) {
        console.error('Error creating job:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// GET all jobs (proxy to backend)
export async function GET() {
    try {
        const backendRes = await fetch('http://localhost:5000/api/jobs');
        const data = await backendRes.json();
        const status = backendRes.status;
        return NextResponse.json(data, { status });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// Disallow other methods explicitly
export async function PUT() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

