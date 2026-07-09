import Link from "next/link";

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 5.7 5.69 5.7c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
    </svg>
  );
}

export default function Home() {
  return (
    <div
      className="relative -mt-16 flex min-h-screen items-end justify-center bg-contain bg-center bg-no-repeat pb-32 sm:pb-40"
      style={{ backgroundImage: "url('/brand/hero.jpg')", backgroundColor: "#fec901" }}
    >
      <div className="flex flex-col items-center gap-6">
        <Link
          href="/shop"
          className="rounded-full bg-black px-8 py-3 text-sm font-medium tracking-wide text-white uppercase transition hover:bg-black/80"
        >
          Shop Now
        </Link>

        <div className="flex items-center gap-5 text-black">
          <a
            href="https://www.instagram.com/thehouse.pg?igsh=Zm4wMDB2MWVwZmps"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="transition hover:opacity-70"
          >
            <InstagramIcon />
          </a>
          <a
            href="https://www.tiktok.com/@house.pg?_r=1&_t=ZS-97qbxbDjXph"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="transition hover:opacity-70"
          >
            <TikTokIcon />
          </a>
        </div>
      </div>
    </div>
  );
}
