import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
    try {
        const categories = await prisma.expense.groupBy({
            by: ['category'],
            _sum: {
                amount: true,
            },
            orderBy: {
                _sum: {
                    amount: 'desc',
                },
            },
        })

        return NextResponse.json(categories)
    } catch (error) {
        return NextResponse.json({ error: `Failed to get categories: ${error}`  }, { status: 500 })
    }
}