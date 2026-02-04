import { Activity, CheckCircle, Clock, FileText, X } from "lucide-react";
import React from "react";

export const getStatusStyles = (status?: string) => {
    const s = (status ?? "").toString().toLowerCase();
    switch (s) {
        case "active": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
        case "registered": return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
        case "funded": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
        case "pending": case "created": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
        case "completed": case "paid": return "bg-green-500/20 text-green-300 border-green-500/30";
        case "cancelled": case "rejected": return "bg-red-500/20 text-red-300 border-red-500/30";
        default: return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
};
  
export const getStatusIcon = (status?: string) => {
    const s = (status ?? "").toString().toLowerCase();
    switch (s) {
        case "active": return React.createElement(Activity, { className: "w-3 h-3" });
        case "pending": case "created": return React.createElement(Clock, { className: "w-3 h-3" });
        case "completed": case "paid": return React.createElement(CheckCircle, { className: "w-3 h-3" });
        case "cancelled": case "rejected": return React.createElement(X, { className: "w-3 h-3" });
        default: return React.createElement(FileText, { className: "w-3 h-3" });
    }
};
