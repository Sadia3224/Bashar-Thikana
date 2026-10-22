import { Building2, ClipboardCheck, Flag, LayoutDashboard, UserRound, UsersRound } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useProperties } from "../../context/PropertyContext";

export default function AdminLayout() {
  const { properties, reports } = useProperties();

  const nav = [
    {
      title: "Console",
      items: [{ to: "/admin", label: "Overview", icon: LayoutDashboard, end: true }],
    },
    {
      title: "Manage",
      items: [
        { to: "/admin/users", label: "User management", icon: UsersRound },
        { to: "/admin/properties", label: "Property management", icon: Building2 },
        { to: "/admin/verification", label: "Listing verification", icon: ClipboardCheck, badge: properties.filter((p) => p.status === "pending").length },
        { to: "/admin/reports", label: "Reports", icon: Flag, badge: reports.filter((r) => r.status === "open").length },
      ],
    },
    {
      title: "Account",
      items: [{ to: "/admin/profile", label: "Admin profile", icon: UserRound }],
    },
  ];

  return <DashboardLayout nav={nav} variant="admin" caption="Admin console" />;
}
