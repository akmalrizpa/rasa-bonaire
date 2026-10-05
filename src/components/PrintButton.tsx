"use client";

import { btnOutline } from "@/components/ui";
import { IconReceipt } from "@/components/Icons";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={`${btnOutline} no-print`}>
      <IconReceipt size={16} /> Print or save as PDF
    </button>
  );
}
