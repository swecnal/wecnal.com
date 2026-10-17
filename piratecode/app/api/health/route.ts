import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await store.getCode("healthcheck");
    return NextResponse.json({ ok: true, database: store.persistent });
  } catch (err) {
    console.error("[piratecode] health check failed", err);
    return NextResponse.json({ ok: false, database: store.persistent }, { status: 503 });
  }
}
