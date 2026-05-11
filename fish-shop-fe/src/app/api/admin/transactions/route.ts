import { forwardAdminRequest } from "@/app/api/admin/_proxy";

export async function GET(request: Request) {
  return forwardAdminRequest(request, "/api/admin/transactions");
}
