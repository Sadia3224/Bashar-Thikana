import { Building2, CalendarDays, LayoutDashboard, MessageSquare, PlusCircle, UserRound } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { useProperties } from "../../context/PropertyContext";

export default function OwnerLayout() {
  const { user } = useAuth();
  const { requests } = useProperties();
  const pending = (kind) => requests.filter((r) => r.ownerId === user.id && r.kind === kind && r.status === "pending").length;

  const nav = [
    {
      title: "Overview",
      items: [{ to: "/owner", label: "Dashboard", icon: LayoutDashboard, end: true }],
    },
    {
      title: "Listings",
      items: [
        { to: "/owner/properties", label: "My properties", icon: Building2, end: true },
        { to: "/owner/properties/new", label: "Add new property", icon: PlusCircle },
      ],
    },
    {
      title: "Requests",
      items: [
        { to: "/owner/visits", label: "Visit requests", icon: CalendarDays, badge: pending("visit") },
        { to: "/owner/contacts", label: "Client messages", icon: MessageSquare, badge: pending("contact") },
      ],
    },
    {
      title: "Account",
      items: [{ to: "/owner/profile", label: "Profile", icon: UserRound }],
    },
  ];

  return <DashboardLayout nav={nav} caption="Owner dashboard" />;
}
