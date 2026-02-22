import React, { useState, useEffect } from 'react';
import { supabase } from "@/api/supabaseClient"; // ADD THIS
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, Search, Shield, Loader2, FileText,
  Settings, Activity, RefreshCw, LogOut
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import ReservationCard from "@/components/reservation/ReservationCard";
import ReservationStats from "@/components/admin/ReservationStats";
import PinVerification from "@/components/admin/PinVerification";
import OverrideDialog from "@/components/admin/OverrideDialog";
import { findConflicts } from "@/components/reservation/ConflictChecker";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState(null);
  
  // Rejection dialog
  const [rejectDialog, setRejectDialog] = useState({ open: false, reservation: null });
  const [rejectReason, setRejectReason] = useState("");
  
  // Override dialog
  const [overrideDialog, setOverrideDialog] = useState({ 
    open: false, 
    reservation: null, 
    conflicts: [] 
  });
  
  useEffect(() => {
    if (isAuthenticated) {
      loadReservations();
      
      const unsubscribe = base44.entities.Reservation.subscribe((event) => {
        if (event.type === 'create') {
          setReservations(prev => [event.data, ...prev]);
          toast.info(`Peminjaman baru: ${event.data.reservation_id}`);
        } else if (event.type === 'update') {
          setReservations(prev => prev.map(r => r.id === event.id ? event.data : r));
        } else if (event.type === 'delete') {
          setReservations(prev => prev.filter(r => r.id !== event.id));
        }
      });
      
      return unsubscribe;
    }
  }, [isAuthenticated]);
  
  const loadReservations = async () => {
    setIsLoading(true);
    const data = await base44.entities.Reservation.list('-created_date');
    setReservations(data);
    setIsLoading(false);
  };
  
  const handleApprove = async (reservation) => {
    // Check if it's an extension approval
    if (reservation.isExtendApproval) {
      setProcessingId(reservation.id);
      
      await base44.entities.Reservation.update(reservation.id, { 
        end_time: reservation.extend_request.new_end_time,
        extend_request: null
      });
      
      await base44.entities.ActivityLog.create({
        action: "reservation_approved",
        reservation_id: reservation.reservation_id,
        details: `Perpanjangan waktu disetujui hingga ${reservation.extend_request.new_end_time}`,
        actor_name: "Admin"
      });
      
      toast.success(`Perpanjangan ${reservation.reservation_id} disetujui`);
      setProcessingId(null);
      return;
    }
    
    setProcessingId(reservation.id);
    
    await base44.entities.Reservation.update(reservation.id, { status: "approved" });
    
    await base44.entities.ActivityLog.create({
      action: "reservation_approved",
      reservation_id: reservation.reservation_id,
      room_id: reservation.room_id,
      details: `Peminjaman ${reservation.reservation_id} disetujui untuk ${reservation.room_name}`,
      actor_name: "Admin"
    });
    
    toast.success(`Peminjaman ${reservation.reservation_id} disetujui`);
    setProcessingId(null);
  };
  
  const openRejectDialog = (reservation) => {
    setRejectDialog({ open: true, reservation });
    setRejectReason("");
  };
  
  const handleReject = async () => {
    const { reservation } = rejectDialog;
    setProcessingId(reservation.id);
    
    // Check if it's an extension rejection
    if (reservation.isExtendReject) {
      await base44.entities.Reservation.update(reservation.id, { 
        extend_request: null
      });
      
      await base44.entities.ActivityLog.create({
        action: "reservation_rejected",
        reservation_id: reservation.reservation_id,
        details: `Perpanjangan waktu ditolak. Alasan: ${rejectReason || "Tidak ada alasan"}`,
        actor_name: "Admin"
      });
      
      toast.success(`Perpanjangan ${reservation.reservation_id} ditolak`);
    } else {
      await base44.entities.Reservation.update(reservation.id, { 
        status: "rejected",
        admin_notes: rejectReason || "Peminjaman ditolak oleh admin"
      });
      
      await base44.entities.ActivityLog.create({
        action: "reservation_rejected",
        reservation_id: reservation.reservation_id,
        room_id: reservation.room_id,
        details: `Peminjaman ${reservation.reservation_id} ditolak. Alasan: ${rejectReason || "Tidak ada alasan"}`,
        actor_name: "Admin"
      });
      
      toast.success(`Peminjaman ${reservation.reservation_id} ditolak`);
    }
    
    setRejectDialog({ open: false, reservation: null });
    setProcessingId(null);
  };
  
  const handleOverrideClick = (reservation) => {
    // Find conflicting reservations
    const conflicts = findConflicts(reservation, reservations.filter(r => 
      r.status === 'approved' && r.id !== reservation.id
    ));
    
    if (conflicts.length === 0) {
      toast.info("Tidak ada jadwal yang bentrok. Silakan setujui langsung.");
      return;
    }
    
    setOverrideDialog({ open: true, reservation, conflicts });
  };
  
  const handleOverrideConfirm = async (data) => {
    setProcessingId(overrideDialog.reservation.id);
    
    // Cancel conflicting reservations
    for (const resId of data.cancelReservationIds) {
      const conflictRes = reservations.find(r => r.id === resId);
      await base44.entities.Reservation.update(resId, { 
        status: "cancelled",
        admin_notes: `Dibatalkan karena override prioritas admin. Alasan: ${data.reason}`
      });
      
      await base44.entities.ActivityLog.create({
        action: "reservation_rejected",
        reservation_id: conflictRes?.reservation_id,
        details: `Peminjaman dibatalkan karena override prioritas admin. Alasan: ${data.reason}`,
        actor_name: "Admin"
      });
    }
    
    // Approve the priority reservation
    await base44.entities.Reservation.update(overrideDialog.reservation.id, { status: "approved" });
    
    await base44.entities.ActivityLog.create({
      action: "reservation_approved",
      reservation_id: overrideDialog.reservation.reservation_id,
      details: `Peminjaman disetujui dengan override prioritas admin. Alasan: ${data.reason}`,
      actor_name: "Admin"
    });
    
    toast.success("Override berhasil. Peminjaman prioritas disetujui.");
    setOverrideDialog({ open: false, reservation: null, conflicts: [] });
    setProcessingId(null);
    loadReservations();
  };
  
  const filteredReservations = reservations.filter(res => {
    const matchesStatus = statusFilter === "all" || res.status === statusFilter;
    const matchesSearch = 
      res.reservation_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.borrower_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.room_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });
  
  const pendingCount = reservations.filter(r => r.status === "pending").length;
  const extendPendingCount = reservations.filter(r => r.status === "approved" && r.extend_request).length;
  
  const handleLogout = () => {
    setIsAuthenticated(false);
  };
  
  if (!isAuthenticated) {
    return <PinVerification onVerified={() => setIsAuthenticated(true)} />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link to={createPageUrl("Home")} className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Kembali ke Beranda
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Admin SUPERDUPER</h1>
                <p className="text-slate-500 text-sm">Kelola peminjaman ruangan</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to={createPageUrl("AdminRooms")}>
              <Button variant="outline" className="h-10">
                <Settings className="w-4 h-4 mr-2" />
                Kelola Ruangan
              </Button>
            </Link>
            <Link to={createPageUrl("AdminLogs")}>
              <Button variant="outline" className="h-10">
                <Activity className="w-4 h-4 mr-2" />
                Log Aktivitas
              </Button>
            </Link>
            <Button variant="outline" className="h-10" onClick={loadReservations}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="h-10 text-red-600 hover:bg-red-50" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="mb-8">
          <ReservationStats reservations={reservations} />
        </div>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Cari peminjaman..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-white"
            />
          </div>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="h-11 bg-white border">
              <TabsTrigger value="pending" className="relative">
                Pending
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved" className="relative">
                Disetujui
                {extendPendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                    {extendPendingCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="rejected">Ditolak</TabsTrigger>
              <TabsTrigger value="all">Semua</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Reservation List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">Tidak ada peminjaman</h3>
            <p className="text-slate-400">
              {statusFilter === "pending" 
                ? "Tidak ada peminjaman yang menunggu persetujuan"
                : "Tidak ada peminjaman yang sesuai filter"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((reservation, idx) => (
              <motion.div
                key={reservation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <ReservationCard
                  reservation={reservation}
                  showActions={true}
                  onApprove={handleApprove}
                  onReject={openRejectDialog}
                  onOverride={handleOverrideClick}
                  isProcessing={processingId === reservation.id}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => !open && setRejectDialog({ open: false, reservation: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {rejectDialog.reservation?.isExtendReject ? 'Tolak Perpanjangan' : 'Tolak Peminjaman'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600">
              Menolak {rejectDialog.reservation?.isExtendReject ? 'perpanjangan' : 'peminjaman'} <strong>{rejectDialog.reservation?.reservation_id}</strong> untuk {rejectDialog.reservation?.room_name}
            </p>
            <div className="space-y-2">
              <Label>Alasan (opsional)</Label>
              <Textarea
                placeholder="Berikan alasan penolakan..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, reservation: null })}>
              Batal
            </Button>
            <Button onClick={handleReject} className="bg-red-600 hover:bg-red-700 text-white">
              Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Override Dialog */}
      <OverrideDialog
        open={overrideDialog.open}
        onClose={() => setOverrideDialog({ open: false, reservation: null, conflicts: [] })}
        conflictingReservations={overrideDialog.conflicts}
        newReservation={overrideDialog.reservation}
        onConfirm={handleOverrideConfirm}
        isProcessing={processingId === overrideDialog.reservation?.id}
      />
    </div>
  );
}