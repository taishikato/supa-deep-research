import { NextRequest, NextResponse } from "next/server";

// Handle GET requests to check keys and POST requests to set keys
export async function GET(req: NextRequest) {
  const openaiKey = req.cookies.get("openai-key")?.value;
  const firecrawlKey = req.cookies.get("firecrawl-key")?.value;
  const keysPresent = Boolean(openaiKey && firecrawlKey);
  return NextResponse.json({ keysPresent });
}

export async function POST(req: NextRequest) {
  try {
    const { openaiKey, firecrawlKey } = await req.json();
    const response = NextResponse.json({ success: true });
    response.cookies.set("openai-key", openaiKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
    });
    response.cookies.set("firecrawl-key", firecrawlKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
    });
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to set API keys" },
      { status: 500 },
    );
  }
}

// New: DELETE handler to remove API keys
export async function DELETE(req: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    response.cookies.delete("openai-key");
    response.cookies.delete("firecrawl-key");
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to remove API keys" },
      { status: 500 },
    );
  }
}
