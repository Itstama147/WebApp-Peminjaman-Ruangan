import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle2, XCircle, Calendar } from "lucide-react";

export default function ReservationStats({ reservations }) {
  const pending = reservations.filter(r => r.status === "pending").length;
  const approved = reservations.filter(r => r.status === "approved").length;
  const rejected = reservations.filter(r => r.status === "rejected").length;
  const total = reservations.length;
  
  const stats = [
    { label: "Total", value: total, icon: Calendar, color: "text-slate-600", bg: "bg-slate-100" },
    { label: "Pending", value: pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
    { label: "Disetujui", value: approved, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Ditolak", value: rejected, icon: XCircle, color: "text-red-600", bg: "bg-red-100" }
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="border-0 shadow-sm bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}