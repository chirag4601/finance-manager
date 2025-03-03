import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get("id") || "0");

  if (!id) {
    return NextResponse.json({ error: "Missing expense ID" }, { status: 400 });
  }

  try {
    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to get expense: ${error}` },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get("id") || "0");

  if (!id) {
    return NextResponse.json({ error: "Missing expense ID" }, { status: 400 });
  }

  const data = await request.json();

  if (data.date) {
    data.date = new Date(data.date);
  }

  try {
    const expense = await prisma.expense.update({
      where: { id },
      data: {
        amount: data.amount ? parseFloat(data.amount) : undefined,
        category: data.category,
        description: data.description,
        date: data.date,
      },
    });

    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update expense: ${error}` },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get("id") || "0");

  if (!id) {
    return NextResponse.json({ error: "Missing expense ID" }, { status: 400 });
  }

  try {
    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to delete expense: ${error}` },
      { status: 500 },
    );
  }
}
