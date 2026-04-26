# Hoàn thiện Module Quản lý Blog

Mục tiêu: Bổ sung luồng xuất bản (Publish Workflow) cho bài viết và tích hợp tải ảnh lên Cloudinary. Đảm bảo cấu trúc code hiện tại không bị phá vỡ, chỉ chỉnh sửa trên các tệp đã có và bổ sung enum.

## Open Questions
- Với trường `isPublished` và enum `PostStatus`, hệ thống sẽ đồng bộ 2 trường này: Khi `status` là `PUBLISHED`, `isPublished` tự động thành `true`, ngược lại là `false`. Bạn đồng ý với cách tiếp cận này không?

## Proposed Changes

### Backend

#### [NEW] [PostStatus.java](file:///d:/code/fish-breeding-system/fish-shop-be/src/main/java/com/fishbreeding/backend/entity/PostStatus.java)
- Tạo mới Enum `PostStatus` gồm 3 trạng thái: `DRAFT`, `PUBLISHED`, `ARCHIVED`.

#### [MODIFY] [BlogPost.java](file:///d:/code/fish-breeding-system/fish-shop-be/src/main/java/com/fishbreeding/backend/entity/BlogPost.java)
- Thêm trường `@Column(name = "is_published") private Boolean isPublished = false;`.
- Thêm trường `@Enumerated(EnumType.STRING) @Column(nullable = false) private PostStatus status = PostStatus.DRAFT;`.
- Thêm trường `@Column(name = "published_at") private LocalDateTime publishedAt;`.

#### [MODIFY] [BlogPostRequest.java](file:///d:/code/fish-breeding-system/fish-shop-be/src/main/java/com/fishbreeding/backend/dto/BlogPostRequest.java)
- Bổ sung trường `PostStatus status;` để Frontend có thể chọn trạng thái khi tạo hoặc cập nhật bài viết.

#### [MODIFY] [BlogPostResponse.java](file:///d:/code/fish-breeding-system/fish-shop-be/src/main/java/com/fishbreeding/backend/dto/BlogPostResponse.java)
- Bổ sung `isPublished`, `status`, `publishedAt` vào object trả về.

#### [MODIFY] [BlogPostService.java](file:///d:/code/fish-breeding-system/fish-shop-be/src/main/java/com/fishbreeding/backend/service/BlogPostService.java)
- Cập nhật logic `createBlogPost` và `updateBlogPost` để xử lý trạng thái.
- Nếu cập nhật từ `DRAFT`/`ARCHIVED` sang `PUBLISHED`, gán `isPublished = true` và `publishedAt = LocalDateTime.now()` (nếu `publishedAt` đang null).
- Nếu chuyển về `DRAFT` hoặc `ARCHIVED`, set `isPublished = false`.

---

### Frontend

#### [MODIFY] [types/blog.ts](file:///d:/code/fish-breeding-system/fish-shop-fe/src/types/blog.ts)
- Bổ sung `status`, `isPublished`, `publishedAt` vào interface `BlogPostRequest` và `BlogPostResponse`.

#### [MODIFY] [blog.service.ts](file:///d:/code/fish-breeding-system/fish-shop-fe/src/services/blog.service.ts)
- Bổ sung phương thức `uploadImage(file: File)` gọi đến API `/api/admin/uploads/cloudinary` hiện có trên server.

#### [MODIFY] [BlogForm.tsx](file:///d:/code/fish-breeding-system/fish-shop-fe/src/components/admin/BlogForm.tsx)
- Thêm UI Dropdown/Select cho trường `Trạng thái` (Bản nháp, Xuất bản, Lưu trữ). Khi tạo mới, mặc định là Bản nháp.
- Nâng cấp input nhập URL của `thumbnailUrl` thành giao diện Upload Image (sử dụng `useRef` và gọi `BlogService.uploadImage`) tương tự như ở module Category.
- Hỗ trợ xem trước ảnh, xoá ảnh và loading khi đang upload.

#### [MODIFY] [blog/page.tsx](file:///d:/code/fish-breeding-system/fish-shop-fe/src/app/admin/(dashboard)/blog/page.tsx)
- Cập nhật Table danh sách bài viết: Thêm cột `Trạng thái` hiển thị dạng Badge/Chip (VD: xanh cho Xuất bản, xám cho Bản nháp).
- Điều chỉnh cột `Ngày đăng` ưu tiên hiển thị ngày xuất bản (`publishedAt`) hoặc ngày tạo.

## Verification Plan
1. **API Verification:** Chạy Backend, dùng API test thử tạo bài viết, cập nhật bài viết qua các trạng thái để kiểm tra tính đúng đắn của logic lưu thời gian và đồng bộ `isPublished`.
2. **Frontend UI:** Truy cập `/admin/blog/add`, kiểm tra thao tác tải ảnh lên có gọi đúng hàm Cloudinary và hiển thị preview hay không. Đăng bài với trạng thái Bản nháp rồi Cập nhật thành Xuất bản, kiểm tra dữ liệu thay đổi trên Table.
