import React from 'react';
import { Button } from "@/components/ui/button";
import { LayoutGrid, CheckCircle2, Clock, XCircle } from "lucide-react";

const filters = [
  { value: "all", label: "Semua", icon: LayoutGrid },
  { value: "available", label: "Tersedia", icon: CheckCircle2, color: "text-emerald-600" },
  { value: "in_use", label: "Digunakan", icon: Clock, color: "text-amber-600" },
  { value: "unavailable", label: "Tidak Tersedia", icon: XCircle, color: "text-slate-500" }
];

export default function RoomStatusFilter({ activeFilter, onFilterChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.value;
        return (
          <Button
            key={filter.value}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(filter.value)}
            className={`
              transition-all duration-300
              ${isActive 
                ? "bg-slate-900 text-white shadow-lg" 
                : "bg-white hover:bg-slate-50 border-slate-200"
              }
            `}
          >
            <Icon className={`w-4 h-4 mr-1.5 ${!isActive && filter.color}`} />
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
}