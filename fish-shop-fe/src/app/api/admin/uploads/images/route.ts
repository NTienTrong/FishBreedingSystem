import { forwardAdminRequest } from "@/app/api/admin/_proxy";

export async function POST(request: Request) {
  return forwardAdminRequest(request, "/api/admin/uploads/images");
}
