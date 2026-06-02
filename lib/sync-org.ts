import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

/**
 * Sync an organization from Clerk to the database.
 * This ensures the organization exists in the database even if the initial sync failed.
 */
export async function syncOrganizationFromClerk(orgSlug: string) {
  try {
    // First, try to find the organization in the database by slug
    let organization = await prisma.organization.findUnique({
      where: { slug: orgSlug },
    });

    if (organization) {
      return organization;
    }

    const { userId } = await auth();
    if (!userId) {
      return null;
    }

    const client = await clerkClient();

    // Get user organizations from Clerk
    const userOrganizations = await client.users.getOrganizationMembershipList({
      userId,
    });

    // Find matching organization
    const membershipData = userOrganizations.data?.find(
      (m) => m.organization.slug === orgSlug
    );

    if (!membershipData) {
      return null;
    }

    const clerkOrgMatch = membershipData.organization;

    // Try to find in database by clerkOrgId
    organization = await prisma.organization.findUnique({
      where: { clerkOrgId: clerkOrgMatch.id },
    });

    if (organization) {
      return organization;
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkUserId: userId,
          email: `${userId}@temp.com`,
          name: "User",
        },
      });
    }

    // Create organization with required email field
    const slug = clerkOrgMatch.slug || orgSlug || `org-${clerkOrgMatch.id.substring(4, 12)}`;
    const name = clerkOrgMatch.name || "Organization";
    const email = `${slug}@organization.local`;
    
    try {
      organization = await prisma.organization.create({
        data: {
          clerkOrgId: clerkOrgMatch.id,
          name: name,
          email: email,
          slug: slug,
        },
      });
    } catch (createError: any) {
      // If creation fails due to unique constraint, try to find it again
      if (createError.code === 'P2002') {
        console.warn(`Unique constraint violation, attempting to find existing org`);
        organization = await prisma.organization.findUnique({
          where: { clerkOrgId: clerkOrgMatch.id },
        });
        if (organization) {
          return organization;
        }
      }
      throw createError;
    }

    // Get the user's actual role in Clerk
    const clerkRole = membershipData.role || "member";

    // Ensure membership exists with correct role
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: organization.id,
        userId: user.id,
      },
    });

    if (!membership) {
      await prisma.organizationMember.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          role: clerkRole,
        },
      });
    } else if (membership.role !== clerkRole) {
      // Update role if it changed in Clerk
      await prisma.organizationMember.update({
        where: { id: membership.id },
        data: { role: clerkRole },
      });
    }

    return organization;
  } catch (error) {
    console.error(`Failed to sync organization ${orgSlug}:`, error);
    return null;
  }
}
