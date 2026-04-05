import { NextRequest, NextResponse } from "next/server"

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const error = request.nextUrl.searchParams.get("error")

  if (error) {
    return NextResponse.json({ error: "Authorization failed" }, { status: 400 })
  }

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 })
  }

  const safeCode = escapeHtml(code)

  return new NextResponse(
    `<html>
      <head><title>Spotify Auth</title></head>
      <body style="font-family: Inter, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f1f5f9;">
        <div style="background: white; padding: 32px; border-radius: 12px; max-width: 600px; width: 100%;">
          <h2 style="margin-top: 0;">Authorization Code</h2>
          <p>Copy this code and paste it in the terminal command:</p>
          <code style="display: block; background: #f1f5f9; padding: 16px; border-radius: 8px; word-break: break-all; font-size: 14px;">${safeCode}</code>
        </div>
      </body>
    </html>`,
    { headers: { "Content-Type": "text/html" } }
  )
}
