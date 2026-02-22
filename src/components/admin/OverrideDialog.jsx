import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2, ShieldAlert } from "lucide-react";

export default function OverrideDialog({ 
  open, 
  onClose, 
  conflictingReservations = [],
  newReservation,
  onConfirm,
  isProcessing
}) {
  const [reason, setReason] = useState("");
  
  const handleConfirm = () => {
    onConfirm({
      reason,
      cancelReservationIds: conflictingReservations.map(r => r.id)
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <ShieldAlert className="w-5 h-5" />
            Override Prioritas Admin
          </DialogTitle>
          <DialogDescription>
            Fitur ini akan membatalkan peminjaman yang bertabrakan dan menyetujui peminjaman prioritas.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              <strong>Perhatian:</strong> Peminjaman berikut akan DIBATALKAN:
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {conflictingReservations.map((res) => (
              <div key={res.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="font-medium text-red-800">{res.reservation_id}</p>
                <p className="text-sm text-red-600">
                  {res.borrower_name} - {res.room_name}
                </p>
                <p className="text-sm text-red-600">
                  {res.reservation_date} ({res.start_time} - {res.end_time})
                </p>
              </div>
            ))}
          </div>
          
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-sm font-medium text-emerald-700 mb-1">Peminjaman yang akan DISETUJUI:</p>
            <p className="font-medium text-emerald-800">{newReservation?.reservation_id}</p>
            <p className="text-sm text-emerald-600">
              {newReservation?.borrower_name} - {newReservation?.room_name}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Alasan Override (Wajib)</Label>
            <Textarea
              placeholder="Contoh: Rapat penting sekolah, Ujian nasional, dll."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!reason.trim() || isProcessing}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Konfirmasi Override'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}