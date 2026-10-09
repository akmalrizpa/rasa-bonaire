import { NextResponse } from "next/server";
import { checkDatabase } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * Debug endpoint for the deployment. Open /api/health in the browser to see
 * which storage mode the site is running in and, when Supabase is configured,
 * whether it can actually be reached. 503 means the database is configured
 * but broken: the site still renders (demo fallback) but orders will fail
 * until the connection is fixed.
 */
export async function GET() {
  const result = await checkDatabase();
  return NextResponse.json(
    {
      ...result,
      hint:
        result.mode === "demo"
          ? "Running on in-memory demo data. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (and run supabase/schema.sql) for persistent storage."
          : result.ok
            ? "Supabase is reachable and seeded."
            : "Supabase is configured but unreachable. Check that the project is not paused, the service_role key is correct, and supabase/schema.sql was run. Reads fall back to demo data until this is fixed; new orders will fail.",
    },
    { status: result.ok ? 200 : 503 },
  );
}
