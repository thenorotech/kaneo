import { Badge } from "@/components/ui/badge";

type CharterStatusBadgeProps = {
  status:
    | "pending_charter"
    | "pending_approval"
    | "approved"
    | "returned_with_observations";
};

export default function CharterStatusBadge({
  status,
}: CharterStatusBadgeProps) {
  switch (status) {
    case "pending_charter":
      return <Badge variant="secondary">Drafting</Badge>;
    case "pending_approval":
      return (
        <Badge
          variant="outline"
          className="text-yellow-600 border-yellow-600 bg-yellow-50"
        >
          Pending Approval
        </Badge>
      );
    case "approved":
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
          Approved
        </Badge>
      );
    case "returned_with_observations":
      return <Badge variant="destructive">Returned</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}
