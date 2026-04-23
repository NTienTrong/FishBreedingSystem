import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

function buildCloudinarySignature(params: Record<string, string>, apiSecret: string): string {
  const signaturePayload = Object.entries(params)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(`${signaturePayload}${apiSecret}`)
    .digest("hex");
}

export async function POST(request: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { message: "Thiếu cấu hình Cloudinary ở biến môi trường." },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("adminToken")?.value;
  const role = cookieStore.get("adminRole")?.value?.toUpperCase();

  if (!token || role !== "ADMIN") {
    return NextResponse.json({ message: "Không có quyền upload ảnh." }, { status: 401 });
  }

  const requestFormData = await request.formData();
  const file = requestFormData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Không tìm thấy file upload." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ message: "Chỉ chấp nhận file ảnh." }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return NextResponse.json(
      { message: "Kích thước ảnh vượt quá 10MB." },
      { status: 400 }
    );
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signatureParams: Record<string, string> = { timestamp };
  if (folder) {
    signatureParams.folder = folder;
  }

  const signature = buildCloudinarySignature(signatureParams, apiSecret);

  const fileArrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(fileArrayBuffer);
  const dataUri = `data:${file.type};base64,${fileBuffer.toString("base64")}`;

  const cloudinaryFormData = new FormData();
  cloudinaryFormData.append("file", dataUri);
  cloudinaryFormData.append("api_key", apiKey);
  cloudinaryFormData.append("timestamp", timestamp);
  cloudinaryFormData.append("signature", signature);
  if (folder) {
    cloudinaryFormData.append("folder", folder);
  }

  const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: cloudinaryFormData,
  });

  const uploadData = (await uploadResponse.json()) as {
    secure_url?: string;
    public_id?: string;
    error?: { message?: string };
  };

  if (!uploadResponse.ok || !uploadData.secure_url) {
    return NextResponse.json(
      {
        message:
          uploadData.error?.message || "Upload ảnh lên Cloudinary thất bại.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    secureUrl: uploadData.secure_url,
    publicId: uploadData.public_id || null,
  });
}
