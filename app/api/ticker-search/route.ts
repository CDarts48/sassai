import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keywords = searchParams.get("keywords");
  if (!keywords) {
    return NextResponse.json({ error: "Missing keywords" }, { status: 400 });
  }
  
  const apikey = process.env.ALPHA_VANTAGE_API_KEY;
  const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(
    keywords
  )}&apikey=${apikey}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json(
      { error: `Alpha Vantage API error: ${res.status}` },
      { status: res.status }
    );
  }
  
  const data = await res.json();
  return NextResponse.json(data);
}