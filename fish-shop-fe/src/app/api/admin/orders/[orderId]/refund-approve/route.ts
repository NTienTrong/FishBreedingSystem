import { forwardAdminRequest } from "@/app/api/admin/_proxy";

export async function PATCH(request: Request, { params }: { params: { orderId: string } }) {
  return forwardAdminRequest(request, `/api/v1/orders/${params.orderId}/admin-approve-refund`);
}
