import { forwardAdminRequest } from "@/app/api/admin/_proxy";

export async function GET(request: Request) {
  return forwardAdminRequest(request, "/api/v1/admin/coupons");
}

export async function POST(request: Request) {
  return forwardAdminRequest(request, "/api/v1/admin/coupons");
}
