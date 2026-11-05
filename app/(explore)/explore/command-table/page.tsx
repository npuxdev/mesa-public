import type { Metadata } from "next";
import { CommandTableWorkbench } from "@/explorations/command-table/CommandTableWorkbench";

export const metadata: Metadata = {
  title: "Spatial Illumination Lab · MESA",
  description: "Development workbench for the MESA spatial command table. Not linked from product or marketing navigation.",
};

export default function CommandTableLabPage() {
  return <CommandTableWorkbench />;
}
