
import { NextResponse } from "next/server";
import { getDictionary } from "@/lib/dictionaries";

export async function GET() {
    try {
        const dict = await getDictionary("ka");
        return NextResponse.json({
            lang: "ka",
            wishlist: dict.wishlist,
            hasWishlist: !!dict.wishlist,
            sampleTitle: dict.wishlist?.title
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
