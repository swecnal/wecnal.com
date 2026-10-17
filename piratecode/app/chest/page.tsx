import type { Metadata } from "next";
import { ChestList } from "@/components/ChestList";

export const metadata: Metadata = { title: "My codes" };

export default function Chest() {
  return (
    <div className="wrap">
      <div className="page-head">
        <h1>My codes</h1>
        <p>Every code you made on this device. Stored only in this browser: no account, nothing on our servers.</p>
      </div>
      <ChestList />
    </div>
  );
}
