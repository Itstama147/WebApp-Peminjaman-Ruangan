import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, AlertTriangle, Loader2 } from "lucide-react";
import { findConflicts } from "./ConflictChecker";

export default function ExtendReleaseForm({ 
  reservation, 
  type, // 'extend' or 'release'
  open, 
  onClose, 
  onSubmit, 
  existingReservations = [],
  isSubmitting 
}) {
  const [newEndTime, setNewEndTime] = useState(reservation?.end_time || "");
  const [reason, setReason] = useState("");
  const [conflictWarning, setConflictWarning] = useState(null);
  
  const handleEndTimeChange = (value) => {
    setNewEndTime(value);
    
    if (type === 'extend' && value > reservation.end_time) {
      // Check for conflicts with extended time
      const extendedReservation = {
        ...reservation,
        start_time: reservation.end_time, // Only check the extension period
        end_time: value
      };
      
      const conflicts = findConflicts(extendedReservation, existingReservations, reservation.id);
      if (conflicts.length > 0) {
        setConflictWarning(`Perpanjangan bentrok dengan peminjaman ${conflicts[0].borrower_name} (${conflicts[0].start_time} - ${conflicts[0].end_time})`);
      } else {
        setConflictWarning(null);
      }
    } else {
      setConflictWarning(null);
    }
  };
  
  const handleSubmit = () => {
    if (conflictWarning) return;
    
    onSubmit({
      reservation_id: reservation.id,
      type,
      new_end_time: newEndTime,
      reason
    });
  };
  
  const isExtend = type === 'extend';
  const title = isExtend ? 'Perpanjangan Waktu' : 'Selesai Lebih Awal';
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-slate-50 rounded-lg p-3 text-sm">
            <p className="text-slate-600">Peminjaman saat ini:</p>
            <p className="font-medium">{reservation?.room_name}</p>
            <p className="text-slate-500">{reservation?.start_time} - {reservation?.end_time}</p>
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {isExtend ? 'Jam Selesai Baru' : 'Selesai Pada Jam'}
            </Label>
            <Input
              type="time"
              value={newEndTime}
              onChange={(e) => handleEndTimeChange(e.target.value)}
              min={isExtend ? reservation?.end_time : reservation?.start_time}
              max={isExtend ? undefined : reservation?.end_time}
            />
            {isExtend && (
              <p className="text-xs text-slate-500">Jam harus lebih dari {reservation?.end_time}</p>
            )}
            {!isExtend && (
              <p className="text-xs text-slate-500">Jam harus sebelum {reservation?.end_time}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Alasan</Label>
            <Textarea
              placeholder={isExtend ? "Alasan perpanjangan..." : "Alasan selesai lebih awal..."}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          
          {conflictWarning && (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-700">{conflictWarning}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!newEndTime || !!conflictWarning || isSubmitting}
            className="bg-slate-900 hover:bg-slate-800"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ajukan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}