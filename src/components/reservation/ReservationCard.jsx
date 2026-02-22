import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User, Building2, FileText, Check, X, TimerReset, Timer } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const statusConfig = {
  pending: { label: "Menunggu Persetujuan", color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  approved: { label: "Disetujui", color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  rejected: { label: "Ditolak", color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
  cancelled: { label: "Dibatalkan", color: "bg-slate-100 text-slate-700 border-slate-200", dot: "bg-slate-500" },
  extend_pending: { label: "Perpanjangan Pending", color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" }
};

export default function ReservationCard({ 
  reservation, 
  showActions, 
  onApprove, 
  onReject, 
  onOverride,
  onExtend,
  onRelease,
  isProcessing,
  showUserActions 
}) {
  const status = statusConfig[reservation.status] || statusConfig.pending;
  
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return format(new Date(dateStr), "d MMMM yyyy", { locale: id });
  };
  
  return (
    <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                  {reservation.reservation_id}
                </p>
                <h3 className="text-lg font-semibold text-slate-800">{reservation.room_name}</h3>
              </div>
              <Badge className={`${status.color} border font-medium`}>
                <div className={`w-1.5 h-1.5 rounded-full ${status.dot} mr-1.5`} />
                {status.label}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <User className="w-4 h-4 text-slate-400" />
                <span>{reservation.borrower_name}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>{reservation.class_unit}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{formatDate(reservation.reservation_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{reservation.start_time} - {reservation.end_time}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <p className="line-clamp-2">{reservation.purpose}</p>
              </div>
            </div>
            
            {reservation.admin_notes && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-medium text-slate-500 mb-1">Catatan Admin:</p>
                <p className="text-sm text-slate-700">{reservation.admin_notes}</p>
              </div>
            )}
            
            {reservation.extend_request && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs font-medium text-blue-600 mb-1">Permintaan Perpanjangan:</p>
                <p className="text-sm text-blue-700">
                  Jam baru: {reservation.extend_request.new_end_time}
                  {reservation.extend_request.reason && ` - ${reservation.extend_request.reason}`}
                </p>
              </div>
            )}
            
            {/* User actions for extend/release */}
            {showUserActions && reservation.status === "approved" && (
              <div className="mt-4 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onExtend?.(reservation)}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <TimerReset className="w-4 h-4 mr-1" />
                  Perpanjang
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onRelease?.(reservation)}
                  className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                >
                  <Timer className="w-4 h-4 mr-1" />
                  Selesai Awal
                </Button>
              </div>
            )}
          </div>
          
          {showActions && reservation.status === "pending" && (
            <div className="flex md:flex-col gap-2 p-5 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100">
              <Button
                onClick={() => onApprove(reservation)}
                disabled={isProcessing}
                className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Check className="w-4 h-4 mr-1.5" />
                Setujui
              </Button>
              <Button
                onClick={() => onReject(reservation)}
                disabled={isProcessing}
                variant="outline"
                className="flex-1 md:flex-none border-red-200 text-red-600 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1.5" />
                Tolak
              </Button>
              {onOverride && (
                <Button
                  onClick={() => onOverride(reservation)}
                  disabled={isProcessing}
                  variant="outline"
                  className="flex-1 md:flex-none border-amber-200 text-amber-600 hover:bg-amber-50"
                >
                  Override
                </Button>
              )}
            </div>
          )}
          
          {showActions && reservation.status === "approved" && reservation.extend_request && (
            <div className="flex md:flex-col gap-2 p-5 bg-blue-50 border-t md:border-t-0 md:border-l border-blue-100">
              <Button
                onClick={() => onApprove({ ...reservation, isExtendApproval: true })}
                disabled={isProcessing}
                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Check className="w-4 h-4 mr-1.5" />
                Setujui Perpanjangan
              </Button>
              <Button
                onClick={() => onReject({ ...reservation, isExtendReject: true })}
                disabled={isProcessing}
                variant="outline"
                className="flex-1 md:flex-none border-red-200 text-red-600 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1.5" />
                Tolak
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}