"use client";

import { DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadCsv, toCsv, type CsvCell } from "@/utils/csv";

interface ExportButtonProps {
  filename: string;
  headers: readonly string[];
  rows: readonly (readonly CsvCell[])[];
  label?: string;
}

export function ExportButton({
  filename,
  headers,
  rows,
  label = "Export CSV",
}: ExportButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className="min-h-pms-touch rounded-pms-control"
      disabled={rows.length === 0}
      onClick={() => downloadCsv(filename, toCsv(headers, rows))}
    >
      <DownloadIcon aria-hidden="true" />
      {label}
    </Button>
  );
}
