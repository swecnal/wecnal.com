import type { Metadata } from "next";
import { ChestList } from "@/components/ChestList";

export const metadata: Metadata = { title: "My codes" };

export default function Chest() {
  return (
    <div className="wrap">
      <div className="page-head">
        <p className="kicker">Yer treasure chest</p>
        <h1>My codes</h1>
        <p>Every code ye made on this device, stashed only in this browser. No account, no map for anyone else to follow.</p>
      </div>
      <ChestList />
    </div>
  );
}
