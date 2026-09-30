import fs from "fs";
import path from "path";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Size Chart" };

// Drop the chart image at public/brand/size-chart.jpg and it shows up here.
const SIZE_CHART_SRC = "/brand/size-chart.jpg";

export default function SizeChartPage() {
  const hasChart = fs.existsSync(path.join(process.cwd(), "public", SIZE_CHART_SRC));

  return (
    <div className="theme-noir -mt-16 min-h-screen bg-background pt-16 text-foreground">
      <div className="mx-auto max-w-3xl px-5 py-10">
        <Link
          href="/shop"
          className="mb-6 inline-block text-sm font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground"
        >
          ← Back
        </Link>
        <h1 className="mb-8 text-2xl font-semibold tracking-wide uppercase">Size Chart</h1>

        {hasChart ? (
          <img src={SIZE_CHART_SRC} alt="The House size chart" className="w-full" />
        ) : (
          <p className="text-muted-foreground">Size chart coming soon.</p>
        )}
      </div>
    </div>
  );
}
