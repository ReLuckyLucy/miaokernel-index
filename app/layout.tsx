import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    title: "渺核科技｜让微小产生巨大",
    description: "东莞市渺核科技有限公司，以工程与产品创新连接感知、计算与行动。",
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: {
      title: "渺核科技｜让微小产生巨大",
      description: "从一个细微的信号开始，连接感知、计算与行动。",
      type: "website",
      images: [{ url: `${origin}/og.png`, width: 1792, height: 896, alt: "渺核科技" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "渺核科技｜让微小产生巨大",
      description: "从一个细微的信号开始，连接感知、计算与行动。",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
