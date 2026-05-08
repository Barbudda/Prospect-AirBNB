import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function POST(req: NextRequest, { params }: Params) {
  const { content } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Note content is required" }, { status: 400 });
  }

  const note = await prisma.prospectNote.create({
    data: { prospectId: params.id, content: content.trim() },
  });

  return NextResponse.json({ note }, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { noteId } = await req.json();
  await prisma.prospectNote.delete({ where: { id: noteId, prospectId: params.id } });
  return NextResponse.json({ deleted: true });
}
