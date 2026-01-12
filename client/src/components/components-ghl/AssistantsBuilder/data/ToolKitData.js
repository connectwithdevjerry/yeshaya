// src/data/ToolKitData.js
import { Settings, ToolCase, MapPin, Book, Calendar, Search, Users, AlertTriangle } from 'lucide-react'; // Changed ToolCase to Tool to match actual Lucide icon

export const toolkitItems = [
    { title: "Chat Settings", icon: Settings, type: "panel" },
    { title: "Call Settings", icon: Settings, type: "panel" },
    { title: "Tools & APIs", icon: ToolCase, type: "modal" }, 
    { title: "Map Custom Fields", icon: MapPin, type: "panel" },
    { title: "Knowledge Base", icon: Book, type: "panel" },
    { title: "Calendars", icon: Calendar, type: "modal" },
    { title: "Find & Replace", icon: Search, type: "panel" },
    { title: "Team Notes", icon: Users, type: "panel" },
];

export const bottomMenuItem = {
    title: "Exploration Demo",
    icon: AlertTriangle,
    bgColor: "bg-red-50",
    textColor: "text-red-800",
    hoverBg: "hover:bg-red-100"
};