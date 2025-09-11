// app/api/proxy/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function ALL(req: NextRequest) {
  const u = new URL(req.url);
  const target = u.searchParams.get("u");

  if (!target) return NextResponse.json({ error: "Missing u" }, { status: 400 });

  // (არასავალდებულო) დომენების whitelist
  // if (!target.startsWith(process.env.NEXT_PUBLIC_API_URL!)) {
  //   return NextResponse.json({ error: "forbidden" }, { status: 403 });
  // }

  // ჰედერებიდან ამოიღე ისეთი, რასაც არ უნდა გავატაროთ (accept-encoding და სხვ.)
  const { method, headers } = req;
  const forwardHeaders = new Headers(headers);

  forwardHeaders.delete("host");
  forwardHeaders.delete("accept-encoding");

  const body = method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer();

  const upstreamRes = await fetch(target, {
    method,
    headers: forwardHeaders,
    body: body ? body : undefined,
    redirect: "manual",
  });

  const respBody = await upstreamRes.arrayBuffer();
  const respHeaders = new Headers(upstreamRes.headers);

  return new NextResponse(respBody, {
    status: upstreamRes.status,
    headers: respHeaders,
  });
}

export const GET = ALL;
export const POST = ALL;
export const PUT = ALL;
export const PATCH = ALL;
export const DELETE = ALL;
export const OPTIONS = ALL;
