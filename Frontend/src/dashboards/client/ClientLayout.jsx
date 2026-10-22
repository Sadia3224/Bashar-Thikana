import { CalendarDays, Heart, History, LayoutDashboard, MessageSquare, Search, UserRound } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { useProperties } from "../../context/PropertyContext";

export default function ClientLayout() {
  const { user } = useAuth();
  const { requests, favoriteIds } = useProperties();
  const mine = requests.filter((r) => r.clientId === user.id);

  const nav = [
    {
      title: "Overview",
      items: [
        { to: "/client", label: "Dashboard", icon: LayoutDashboard, end: true },
        { to: "/client/favorites", label: "Saved properties", icon: Heart, badge: favoriteIds.length },
        { to: "/client/searches", label: "Recent searches", icon: History },
      ],
    },
    {
      title: "Requests",
      items: [
        { to: "/client/visits", label: "Visit requests", icon: CalendarDays, badge: mine.filter((r) => r.kind === "visit" && r.status === "pending").length },
        { to: "/client/contacts", label: "Contact requests", icon: MessageSquare },
      ],
    },
    {
      title: "Account",
      items: [
        { to: "/client/profile", label: "Edit profile", icon: UserRound },
        { to: "/properties", label: "Find a home", icon: Search },
      ],
    },
  ];

  return <DashboardLayout nav={nav} caption="Client dashboard" />;
}
