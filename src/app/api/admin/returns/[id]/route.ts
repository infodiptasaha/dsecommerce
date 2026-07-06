import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Return from "@/models/Return";
import Product from "@/models/Product";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    await dbConnect();

    const returnDoc = await Return.findById(id);
    if (!returnDoc) return NextResponse.json({ error: "Return not found" }, { status: 404 });

    const { action, adminNotes, rejectionReason } = body;

    switch (action) {
      case "approve":
        if (returnDoc.status !== "requested") {
          return NextResponse.json({ error: "Can only approve requested returns" }, { status: 400 });
        }
        returnDoc.status = "approved";
        returnDoc.adminNotes = adminNotes || "";
        break;

      case "reject":
        if (returnDoc.status !== "requested") {
          return NextResponse.json({ error: "Can only reject requested returns" }, { status: 400 });
        }
        returnDoc.status = "rejected";
        returnDoc.rejectionReason = rejectionReason || "No reason provided";
        returnDoc.adminNotes = adminNotes || "";
        break;

      case "receive":
        if (returnDoc.status !== "approved") {
          return NextResponse.json({ error: "Can only receive approved returns" }, { status: 400 });
        }
        returnDoc.status = "received";
        returnDoc.adminNotes = adminNotes || "";

        // Restock inventory if enabled
        if (returnDoc.restockInventory) {
          for (const item of returnDoc.items) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { inventory: item.quantity },
            });
          }
        }
        break;

      case "refund":
        if (returnDoc.status !== "received") {
          return NextResponse.json({ error: "Can only refund received returns" }, { status: 400 });
        }
        returnDoc.status = "refunded";
        returnDoc.resolvedAt = new Date();
        returnDoc.adminNotes = adminNotes || "";
        break;

      case "cancel":
        if (!["requested", "approved"].includes(returnDoc.status)) {
          return NextResponse.json({ error: "Cannot cancel this return" }, { status: 400 });
        }
        returnDoc.status = "cancelled";
        returnDoc.resolvedAt = new Date();
        returnDoc.adminNotes = adminNotes || "";
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await returnDoc.save();

    return NextResponse.json({ message: `Return ${action}d`, return: returnDoc });
  } catch (error) {
    console.error("PUT /api/admin/returns/[id] error:", error);
    return NextResponse.json({ error: "Failed to update return" }, { status: 500 });
  }
}
