import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Clock, CheckCircle2, XCircle, FileSearch, Loader2 } from "lucide-react";

const statusConfig = {
  pending: { 
    icon: Clock, 
    label: "Pending Approval", 
    color: "text-amber-600", 
    bg: "bg-amber-50",
    description: "Your reservation is waiting for admin approval"
  },
  approved: { 
    icon: CheckCircle2, 
    label: "Approved", 
    color: "text-emerald-600", 
    bg: "bg-emerald-50",
    description: "Your reservation has been approved. You can use the room as scheduled."
  },
  rejected: { 
    icon: XCircle, 
    label: "Rejected", 
    color: "text-red-600", 
    bg: "bg-red-50",
    description: "Your reservation was not approved. Please try another room or time."
  }
};

export default function StatusTracker({ reservation, searchId, onSearchChange, onSearch, isSearching }) {
  const status = reservation ? statusConfig[reservation.status] : null;
  const StatusIcon = status?.icon;
  
  return (
    <Card className="border-0 shadow-xl bg-white overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Enter your Reservation ID (e.g., RES-XXXXXX)"
              value={searchId}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              className="pl-10 h-12 text-base"
            />
          </div>
          <Button 
            onClick={onSearch}
            disabled={isSearching || !searchId.trim()}
            className="h-12 px-6 bg-slate-900 hover:bg-slate-800"
          >
            {isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <FileSearch className="w-5 h-5 mr-2" />
                Track Status
              </>
            )}
          </Button>
        </div>
        
        {reservation && (
          <div className={`${status.bg} rounded-xl p-6 animate-in fade-in duration-500`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-full bg-white shadow-sm`}>
                <StatusIcon className={`w-8 h-8 ${status.color}`} />
              </div>
              <div>
                <h3 className={`text-xl font-semibold ${status.color}`}>{status.label}</h3>
                <p className="text-sm text-slate-600">{status.description}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Reservation ID:</span>
                <span className="font-medium text-slate-800">{reservation.reservation_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Room:</span>
                <span className="font-medium text-slate-800">{reservation.room_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="font-medium text-slate-800">{reservation.reservation_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Time:</span>
                <span className="font-medium text-slate-800">{reservation.start_time} - {reservation.end_time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Borrower:</span>
                <span className="font-medium text-slate-800">{reservation.borrower_name}</span>
              </div>
            </div>
          </div>
        )}
        
        {!reservation && searchId && !isSearching && (
          <div className="text-center py-8 text-slate-500">
            <FileSearch className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Enter your reservation ID and click "Track Status" to view your reservation</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}