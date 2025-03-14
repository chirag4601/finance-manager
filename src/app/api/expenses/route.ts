import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const category = searchParams.get("category");
  const username = searchParams.get("username");

  const whereClause = { username };

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0);
    end.setHours(23, 59, 59, 999);

    whereClause.date = {
      gte: start,
      lte: end,
    };
  }
  if (category) {
    whereClause.category = category;
  }

  const expenses = await prisma.expense.findMany({
    where: whereClause,
    orderBy: { date: "desc" },
  });

  return NextResponse.json(expenses);
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  // If no date is provided, use current date
  if (!data.date) {
    data.date = new Date();
  } else {
    data.date = new Date(data.date);
  }

  try {
    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(data.amount),
        category: data.category,
        description: data.description || null,
        username: data.username,
        date: data.date,
      },
    });
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to create expense, ${error}` },
      { status: 500 },
    );
  }
}
