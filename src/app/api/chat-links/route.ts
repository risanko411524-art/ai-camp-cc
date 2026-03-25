import { NextResponse } from "next/server";

export async function GET() {
  try {
    const csvUrl = process.env.GOOGLE_SHEET_CSV_URL;
    if (!csvUrl) {
      return NextResponse.json({ links: {} });
    }

    const res = await fetch(csvUrl, { next: { revalidate: 60 } });
    const text = await res.text();
    const lines = text.trim().split("\n");

    const links: Record<string, string> = {};

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",");
      if (cols.length >= 3) {
        const groupKey = cols[0].trim();
        const link = cols[2].trim();
        if (groupKey && link) {
          links[groupKey] = link;
        }
      }
    }

    return NextResponse.json({ links });
  } catch (error) {
    console.error("Failed to fetch chat links:", error);
    return NextResponse.json({ links: {} });
  }
}
