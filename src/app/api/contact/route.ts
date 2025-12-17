import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const body = await request.json()

    // Here we would effectively send the data to an external dashboard or database
    console.log('Received contact submission:', body)

    return NextResponse.json({ success: true, message: "Message received" })
}
