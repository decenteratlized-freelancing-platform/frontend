import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
        return NextResponse.json({ predictions: [] });
    }

    try {
        // Use OpenStreetMap Nominatim API (Free)
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`,
            {
                headers: {
                    "User-Agent": "SmartHiree/1.0", // Nominatim requires a User-Agent
                },
            }
        );

        const data = await response.json();

        if (Array.isArray(data)) {
            // Map Nominatim response to the format expected by the frontend
            // Nominatim format: [ { place_id: 123, display_name: "..." } ]
            // Frontend expects: { predictions: [ { place_id: "...", description: "..." } ] }

            const predictions = data.map((item: any) => ({
                place_id: String(item.place_id),
                description: item.display_name,
            }));

            return NextResponse.json({ predictions });
        } else {
            console.error("Nominatim API error:", data);
            return NextResponse.json({ predictions: [] });
        }
    } catch (error) {
        console.error("Error fetching location suggestions:", error);
        return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 });
    }
}
