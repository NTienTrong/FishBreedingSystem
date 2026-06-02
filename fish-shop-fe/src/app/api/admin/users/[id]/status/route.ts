import { forwardAdminRequest } from "@/app/api/admin/_proxy";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  return forwardAdminRequest(request, `/api/admin/users/${params.id}/status`);
}
