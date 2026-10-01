import { NextRequest, NextResponse } from "next/server";
import {
  originCatalog,
  originCategories,
  originDrinksByLetter,
  originRandomDrink,
  originSearchByName,
  OriginBusyError,
} from "@/lib/cocktail-origin";
import { consumeIpLimit, rateLimitCopy } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_QUERY_LEN = 48;
const TYPES = new Set(["search", "random", "letter", "categories", "catalog"]);

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function limited(retryAfterSec: number, kind: "visitor" | "global") {
  return NextResponse.json(
    {
      error: "rate_limited",
      message: rateLimitCopy(retryAfterSec, kind),
      retryAfter: retryAfterSec,
    },
    {
      status: kind === "global" ? 503 : 429,
      headers: {
        "Retry-After": String(retryAfterSec),
        "Cache-Control": "no-store",
      },
    }
  );
}

function sanitizeQuery(raw: string | null): string {
  return (raw ?? "").trim().slice(0, MAX_QUERY_LEN);
}

export async function GET(request: NextRequest) {
  const ip = clientIp(request);
  const ipLimit = consumeIpLimit(ip);
  if (!ipLimit.ok) {
    return limited(ipLimit.retryAfterSec, "visitor");
  }

  const type = request.nextUrl.searchParams.get("type") ?? "";
  if (!TYPES.has(type)) {
    return NextResponse.json({ error: "invalid_type" }, { status: 400 });
  }

  try {
    if (type === "search") {
      const q = sanitizeQuery(request.nextUrl.searchParams.get("q"));
      if (!q) {
        return NextResponse.json({ error: "missing_query" }, { status: 400 });
      }
      const drinks = await originSearchByName(q);
      return NextResponse.json({ drinks }, { headers: { "Cache-Control": "private, max-age=60" } });
    }

    if (type === "random") {
      const drink = await originRandomDrink();
      return NextResponse.json(
        { drink },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    if (type === "letter") {
      const letter = sanitizeQuery(request.nextUrl.searchParams.get("q"))
        .toLowerCase()
        .slice(0, 1);
      if (!/^[a-z]$/.test(letter)) {
        return NextResponse.json({ error: "invalid_letter" }, { status: 400 });
      }
      const drinks = await originDrinksByLetter(letter);
      return NextResponse.json({ drinks });
    }

    if (type === "categories") {
      const categories = await originCategories();
      return NextResponse.json({ categories });
    }

    const drinks = await originCatalog();
    return NextResponse.json({ drinks });
  } catch (error) {
    if (error instanceof OriginBusyError) {
      return limited(error.retryAfterSec, "global");
    }
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }
}
