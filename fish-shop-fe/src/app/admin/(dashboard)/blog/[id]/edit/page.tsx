import BlogForm from "@/components/admin/BlogForm";

export default function AdminBlogEditPage({ params }: { params: { id: string } }) {
  // Fetch data base on id
  return <BlogForm isEdit={true} />;
}
