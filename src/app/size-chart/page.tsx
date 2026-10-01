import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Size Chart" };

// Images live in public/size-charts/. To add a chart, drop the image there
// and add a line here.
const SIZE_CHARTS = [
  { slug: "tee", name: "House Tee" },
  { slug: "sleeveless", name: "House Sleeveless" },
  { slug: "quarter-zip", name: "House Quarter Zip" },
  { slug: "henley-short-sleeve", name: "Henley Short Sleeve" },
  { slug: "henley-long-sleeve", name: "Henley Long Sleeve" },
  { slug: "classic-chinos", name: "House Classic Chinos" },
  { slug: "capri-pants", name: "House Capri Pants" },
];

export default function SizeChartPage() {
  return (
    <div className="theme-noir -mt-16 min-h-screen bg-background pt-16 text-foreground">
      <div className="mx-auto max-w-3xl px-5 py-10">
        <Link
          href="/shop"
          className="mb-6 inline-block text-sm font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground"
        >
          ← Back
        </Link>
        <h1 className="mb-2 text-2xl font-semibold tracking-wide uppercase">Size Chart</h1>
        <p className="mb-6 text-sm text-muted-foreground">All measurements are in inches.</p>

        <nav className="mb-10 flex flex-wrap gap-2">
          {SIZE_CHARTS.map((chart) => (
            <a
              key={chart.slug}
              href={`#${chart.slug}`}
              className="border border-border px-3 py-1.5 text-xs font-medium tracking-wide uppercase hover:border-foreground"
            >
              {chart.name}
            </a>
          ))}
        </nav>

        <div className="space-y-14">
          {SIZE_CHARTS.map((chart) => (
            <section key={chart.slug} id={chart.slug} className="scroll-mt-20">
              <h2 className="mb-4 text-lg font-semibold tracking-wide uppercase">{chart.name}</h2>
              <img
                src={`/size-charts/${chart.slug}.jpg`}
                alt={`${chart.name} size chart`}
                loading="lazy"
                className="w-full"
              />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
