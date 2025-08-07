import { loginUser } from "@/app/api/services/authService";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { email, password } = await req.json();

    try {
        const token = await loginUser({ email, password });

        (await cookies()).set("admin_token", token, {
            httpOnly: true,
            secure: true,
            path: "/",
            maxAge: 60 * 60 * 2,
            sameSite: "lax",
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 401 });
    }
}
