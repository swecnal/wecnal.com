import { Problem } from "@/components/Problem";
import { MapIcon } from "@/components/PirateIcons";

export default function NotFound() {
  return (
    <Problem icon={<MapIcon size={64} />} kicker="X marks the wrong spot" title="Nothing buried here">
      That page doesn&apos;t exist. Maybe the map was wrong.
    </Problem>
  );
}
