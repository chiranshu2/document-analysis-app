import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params
    const { organizationId } = await params;

    // Get organization
    const organization = await prisma.organization.findUnique({
      where: { clerkOrgId: organizationId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Check if user is owner/admin in Clerk (source of truth)
    const client = await clerkClient();
    const orgMembers = await client.organizations.getOrganizationMembershipList({
      organizationId,
    });

    const userMembership = orgMembers.data?.find(
      (m) => m.publicUserData?.userId === userId
    );

    if (!userMembership) {
      return NextResponse.json(
        { error: "You are not a member of this organization" },
        { status: 403 }
      );
    }

    // Allow owner or admin to delete
    const isAuthorized = userMembership.role === "org:owner" || userMembership.role === "org:admin";

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Only organization owners or admins can delete organizations" },
        { status: 403 }
      );
    }

    // Delete all documents in the organization
    await prisma.document.deleteMany({
      where: { organizationId: organization.id },
    });

    // Delete all organization members
    await prisma.organizationMember.deleteMany({
      where: { organizationId: organization.id },
    });

    // Delete the organization
    await prisma.organization.delete({
      where: { id: organization.id },
    });

    return NextResponse.json({
      success: true,
      message: "Organization deleted successfully",
    });
  } catch (error: any) {
    console.error("[ORGANIZATIONS_DELETE]", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete organization" },
      { status: 500 }
    );
  }
}
