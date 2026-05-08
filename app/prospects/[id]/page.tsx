import { redirect } from "next/navigation";
export default function ProspectDetailRedirect({ params }: { params: { id: string } }) {
  redirect(`/contacts/${params.id}`);
}
