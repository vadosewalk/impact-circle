import { Hono } from "hono";
import { requireAuth, requireRole } from "../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { inviteMemberSchema, updateMemberRoleSchema } from "../lib/schemas";
import { successResponse, errorResponse } from "../lib/response";

const memberRoutes = new Hono<{
  Variables: {
    user: any;
    session: any;
    db: any;
    auth: any;
  };
}>();

// List members of the active organization
memberRoutes.get("/", requireAuth, requireRole("ngo"), async (c) => {
  const auth = c.get("auth");
  // Find organizations where the user is a member
  const organizations = await auth.api.listOrganizations({
    headers: c.req.raw.headers,
  });

  if (!organizations || organizations.length === 0) {
    return errorResponse(c, "No organization found for this user", undefined, 404);
  }

  // For simplicity, we assume the first one is the active one if not specified
  // In a real app, we'd use setActive or a query param
  const orgId = organizations[0].id;

  const members = await auth.api.listMembers({
    query: {
      organizationId: orgId,
    },
    headers: c.req.raw.headers,
  });

  return successResponse(c, "Members fetched successfully", members);
});

// Invite a new member
memberRoutes.post("/invite", requireAuth, requireRole("ngo"), zValidator("json", inviteMemberSchema), async (c) => {
  const auth = c.get("auth");
  const { email, role } = c.req.valid("json");
  const organizations = await auth.api.listOrganizations({
    headers: c.req.raw.headers,
  });

  if (!organizations || organizations.length === 0) {
    return errorResponse(c, "No organization found", undefined, 404);
  }

  const orgId = organizations[0].id;

  try {
    const invitation = await auth.api.createInvitation({
      body: {
        email,
        role,
        organizationId: orgId,
      },
      headers: c.req.raw.headers,
    });

    return successResponse(c, "Invitation sent successfully", invitation);
  } catch (err) {
    return errorResponse(c, err instanceof Error ? err.message : "Failed to send invitation", undefined, 400);
  }
});

// Update member role
memberRoutes.post(
  "/update-role",
  requireAuth,
  requireRole("ngo"),
  zValidator("json", updateMemberRoleSchema),
  async (c) => {
    const auth = c.get("auth");
    const { memberId, role } = c.req.valid("json");

    try {
      const updatedMember = await auth.api.updateMemberRole({
        body: {
          memberId,
          role,
        },
        headers: c.req.raw.headers,
      });

      return successResponse(c, "Member role updated successfully", updatedMember);
    } catch (err) {
      return errorResponse(c, err instanceof Error ? err.message : "Failed to update role", undefined, 400);
    }
  },
);

// Remove a member
memberRoutes.delete("/:id", requireAuth, requireRole("ngo"), async (c) => {
  const auth = c.get("auth");
  const memberId = c.req.param("id");

  try {
    await auth.api.removeMember({
      body: {
        memberIdOrEmail: memberId,
      },
      headers: c.req.raw.headers,
    });

    return successResponse(c, "Member removed successfully");
  } catch (err) {
    return errorResponse(c, err instanceof Error ? err.message : "Failed to remove member", undefined, 400);
  }
});

export { memberRoutes };
