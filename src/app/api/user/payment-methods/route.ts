import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/connectDB";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email }).select("bankAccount paymentMode");

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            bankAccount: user.bankAccount || {},
            paymentMode: user.paymentMode
        });
    } catch (err) {
        console.error("Payment API Error:", err);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const body = await req.json();
        const { bankAccount, paymentMode } = body;

        // Initialize if null (Robustness fix)
        if (!user.bankAccount) {
            user.bankAccount = {}; // Mongoose should handle this if defined in schema, but being explicit is safer
        }

        if (bankAccount) {
            if (bankAccount.accountNo !== undefined) user.bankAccount.accountNo = bankAccount.accountNo;
            if (bankAccount.ifsc !== undefined) user.bankAccount.ifsc = bankAccount.ifsc;
            if (bankAccount.holderName !== undefined) user.bankAccount.holderName = bankAccount.holderName;
            if (bankAccount.upiId !== undefined) user.bankAccount.upiId = bankAccount.upiId;

            // Handle removals
            if (bankAccount.accountNo === null) user.bankAccount.accountNo = undefined;
            if (bankAccount.ifsc === null) user.bankAccount.ifsc = undefined;
            if (bankAccount.holderName === null) user.bankAccount.holderName = undefined;
            if (bankAccount.upiId === null) user.bankAccount.upiId = undefined;
        }

        if (paymentMode) user.paymentMode = paymentMode;

        await user.save();

        return NextResponse.json({ message: "Payment methods updated", user: { bankAccount: user.bankAccount } });

    } catch (err) {
        console.error("Payment Update Error:", err);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
