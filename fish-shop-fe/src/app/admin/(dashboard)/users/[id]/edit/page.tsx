import UserForm from "@/components/admin/UserForm";

export default function AdminUsersEditPage({ params }: { params: { id: string } }) {
  // Fetch real user data with params.id here soon
  return <UserForm isEdit={true} />;
}
