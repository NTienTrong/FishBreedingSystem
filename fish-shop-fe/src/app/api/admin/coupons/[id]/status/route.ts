import { forwardAdminRequest } from "@/app/api/admin/_proxy";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  return forwardAdminRequest(request, `/api/v1/admin/coupons/${params.id}/status`);
}
