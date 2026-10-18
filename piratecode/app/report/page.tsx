import type { Metadata } from "next";
import { ReportForm } from "@/components/ReportForm";

export const metadata: Metadata = { title: "Report a code" };

export default async function Report({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  return (
    <div className="wrap narrow">
      <div className="page-head">
        <p className="kicker">Man the cannons</p>
        <h1>Report a scallywag</h1>
        <p>Scanned something shady? Tell us and we&apos;ll make it walk the plank.</p>
      </div>
      <ReportForm initial={c ?? ""} />
    </div>
  );
}
