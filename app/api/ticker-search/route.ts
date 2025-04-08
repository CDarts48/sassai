import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("keywords");
  if (!symbol) {
    return NextResponse.json({ error: "Missing keywords" }, { status: 400 });
  }
  
  // Optional parameters with defaults:
  const outputsize = searchParams.get("outputsize") || "compact";
  const datatype = searchParams.get("datatype") || "json";
  
  const apikey = process.env.ALPHA_VANTAGE_API_KEY;
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(symbol)}&outputsize=${outputsize}&datatype=${datatype}&apikey=${apikey}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json(
      { error: `Alpha Vantage API error: ${res.status}` },
      { status: res.status }
    );
  }
  
  const data = await res.json();
  console.log("TIME_SERIES_DAILY response:", data);
  
  // Limit the time series to the 4 most recent entries.
  const timeSeriesKey = "Time Series (Daily)";
  if (data[timeSeriesKey]) {
    // Sort the dates in descending order (most recent first)
    const dates = Object.keys(data[timeSeriesKey]).sort((a, b) => (a < b ? 1 : -1));
    const limitedDates = dates.slice(0, 4);
    const limitedSeries: Record<string, unknown> = {};
    limitedDates.forEach((date) => {
      limitedSeries[date] = data[timeSeriesKey][date];
    });
    data[timeSeriesKey] = limitedSeries;
  }
  
  return NextResponse.json(data);
}