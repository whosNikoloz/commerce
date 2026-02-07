import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { searchProducts } from "../../services/productService";

import { ProductResponseModel } from "@/types/product";

// Helper to format currency
const formatCurrency = (price: number, lang: string = "ka") => {
    return new Intl.NumberFormat(lang === "ka" ? "ka-GE" : "en-US", {
        style: "currency",
        currency: "GEL",
    }).format(price).replace("GEL", "₾");
};

export async function POST(req: NextRequest) {
    try {
        // 1. Check for API Key
        const apiKey = process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "API key not configured" },
                { status: 500 }
            );
        }

        // 2. Parse User Input
        const body = await req.json();
        const { history, message, lang = "ka" } = body;

        if (!message) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        // 3. Fetch Enriched Context (Products with Facets/Brands)
        let products: ProductResponseModel[] = [];

        try {
            const searchResult = await searchProducts("", "name", "asc", 1, 30);

            products = searchResult.items;
        } catch (e) {
            console.error("Failed to fetch search results for AI context", e);
        }

        // Prepare Deep Consultant Context (including Brand and Facets)
        const productContext = products.map((p) => {
            const formattedPrice = formatCurrency(p.price, lang);
            const brand = p.brand?.name || "Generic";
            const facets = p.productFacetValues
                ?.map(f => `${f.facetName}: ${f.facetValue}`)
                .join(", ") || "No specific attributes";

            return `- ${p.name} (${formattedPrice}). Brand: ${brand}. Attributes: ${facets}. ID: ${p.id}`;
        }).join("\n");

        const systemInstruction = `
You are a "Product Consultant" for an e-commerce store. 
Your goal is to help users select the best product based on their needs, brands, and specific attributes (like color, size, etc.).

Current Language: ${lang === "ka" ? "Georgian (ka)" : "English (en)"}
RESPONSE LANGUAGE: ALWAYS respond in ${lang === "ka" ? "Georgian" : "English"}.

Here is the context of our TOP PRODUCTS (including brands and attributes):
${productContext}

INSTRUCTIONS:
1. Act as an expert consultant. If a user asks for a specific color (e.g., "Green"), check the "Attributes" in the list above.
2. If a user asks for a recommendation, explain WHY you chose that product based on its brand or attributes.
3. Always include the Product Name and Price in your recommendation.
4. Use the ID to create ROOT-RELATIVE links: /product/[ID] (Example: /product/uuid-here).
5. DO NOT include the language prefix (like /ka/ or /en/) in the link.
6. DO NOT include "https://", "http://", or any domain name.
7. ALWAYS start the link with a leading slash "/".
8. If the product isn't in context, offer similar options from the list.
`;

        // 4. Initialize Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction
        });

        // 5. Start Chat
        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ text });

    } catch (error) {
        console.error("AI Chat Error:", error);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
