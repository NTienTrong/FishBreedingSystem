import { forwardAdminRequest } from "@/app/api/admin/_proxy";

export async function GET(request: Request, { params }: { params: { orderId: string } }) {
  return forwardAdminRequest(request, `/api/admin/orders/${params.orderId}`);
}
