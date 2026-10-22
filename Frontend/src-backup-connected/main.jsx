import { StrictMode } from "react";import { createRoot } from "react-dom/client";import App from "./App";import "./styles/global.css";import "./styles/public.css";import "./styles/consumer.css";import "./styles/owner.css";import "./styles/admin.css";
createRoot(document.getElementById("root")).render(<StrictMode><App/></StrictMode>);
