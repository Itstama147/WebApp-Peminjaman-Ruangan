import React, { useState, useEffect } from 'react';
import { supabase } from "@/api/supabaseClient"; // ADD THIS
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileSearch, Search, Loader2, Clock, CheckCircle2, XCircle, TimerReset, Timer } from "lucide-react";
import { toast } from "sonner";
import ReservationCard from "@/components/reservation/ReservationCard";
import ExtendReleaseForm from "@/components/reservation/ExtendReleaseForm";

export default function TrackStatus() {
  const [searchId, setSearchId] = useState("");
  const [reservation, setReservation] = useState(null);
  const [allReservations, setAllReservations] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  
  // Extend/Release dialog
  const [actionDialog, setActionDialog] = useState({ open: false, type: null, reservation: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const urlParams = new URLSearchParams(window.location.search);
  const prefilledId = urlParams.get('id');
  
  useEffect(() => {
    loadAllReservations();
    if (prefilledId) {
      setSearchId(prefilledId);
      handleSearch(prefilledId);
    }
  }, [prefilledId]);
  
  const loadAllReservations = async () => {
    const data = await base44.entities.Reservation.list();
    setAllReservations(data);
  };
  
 const handleSearch = async (searchId) => {
  setIsLoading(true);
  
  // Search Supabase for the reservation ID entered by the user
  const { data, error } = await supabase
    .from('Reservation')
    .select('*')
    .eq('reservation_id', searchId) // Matches the ID column
    .single(); // We only expect one result

  if (error) {
    console.error("Not found:", error.message);
    setReservation(null);
    toast.error("ID Peminjaman tidak ditemukan");
  } else {
    setReservation(data);
  }
  setIsLoading(false);
};
  
  const handleExtend = (res) => {
    setActionDialog({ open: true, type: 'extend', reservation: res });
  };
  
  const handleRelease = (res) => {
    setActionDialog({ open: true, type: 'release', reservation: res });
  };
  
  const handleExtendReleaseSubmit = async (data) => {
    setIsSubmitting(true);
    
    if (data.type === 'extend') {
      // Submit extension request
      await base44.entities.Reservation.update(data.reservation_id, {
        extend_request: {
          new_end_time: data.new_end_time,
          reason: data.reason,
          requested_at: new Date().toISOString()
        }
      });
      
      await base44.entities.ActivityLog.create({
        action: "reservation_created",
        reservation_id: reservation.reservation_id,
        details: `Perpanjangan waktu diajukan hingga ${data.new_end_time}`,
        actor_name: reservation.borrower_name
      });
      
      toast.success("Permintaan perpanjangan berhasil diajukan");
    } else {
      // Early release
      await base44.entities.Reservation.update(data.reservation_id, {
        end_time: data.new_end_time,
        early_release: true
      });
      
      await base44.entities.ActivityLog.create({
        action: "reservation_created",
        reservation_id: reservation.reservation_id,
        details: `Peminjaman selesai lebih awal pada ${data.new_end_time}`,
        actor_name: reservation.borrower_name
      });
      
      toast.success("Ruangan berhasil dilepas lebih awal");
    }
    
    setIsSubmitting(false);
    setActionDialog({ open: false, type: null, reservation: null });
    handleSearch(searchId);
  };
  
  const statusConfig = {
    pending: { 
      icon: Clock, 
      label: "Menunggu Persetujuan", 
      color: "text-amber-600", 
      bg: "bg-amber-50",
      description: "Peminjaman Anda sedang menunggu persetujuan admin"
    },
    approved: { 
      icon: CheckCircle2, 
      label: "Disetujui", 
      color: "text-emerald-600", 
      bg: "bg-emerald-50",
      description: "Peminjaman Anda telah disetujui. Silakan gunakan ruangan sesuai jadwal."
    },
    rejected: { 
      icon: XCircle, 
      label: "Ditolak", 
      color: "text-red-600", 
      bg: "bg-red-50",
      description: "Peminjaman Anda tidak disetujui. Silakan coba ruangan atau waktu lain."
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to={createPageUrl("Home")} className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali ke Beranda
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Lacak Peminjaman</h1>
          <p className="text-slate-500 mt-1">Masukkan ID peminjaman untuk melihat status</p>
        </div>
        
        <Card className="border-0 shadow-xl bg-white overflow-hidden mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Masukkan ID Peminjaman (contoh: RES-XXXXXX)"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Button 
                onClick={() => handleSearch()}
                disabled={isSearching || !searchId.trim()}
                className="h-12 px-6 bg-slate-900 hover:bg-slate-800"
              >
                {isSearching ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <FileSearch className="w-5 h-5 mr-2" />
                    Lacak
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {reservation && (
          <div className="space-y-4">
            {/* Status Banner */}
            {statusConfig[reservation.status] && (
              <Card className={`border-0 shadow-sm ${statusConfig[reservation.status].bg}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {React.createElement(statusConfig[reservation.status].icon, {
                      className: `w-6 h-6 ${statusConfig[reservation.status].color}`
                    })}
                    <div>
                      <p className={`font-semibold ${statusConfig[reservation.status].color}`}>
                        {statusConfig[reservation.status].label}
                      </p>
                      <p className="text-sm text-slate-600">
                        {statusConfig[reservation.status].description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <ReservationCard 
              reservation={reservation}
              showUserActions={true}
              onExtend={handleExtend}
              onRelease={handleRelease}
            />
          </div>
        )}
        
        {notFound && (
          <Card className="border-0 shadow-sm">
            <CardContent className="text-center py-12">
              <FileSearch className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-700 mb-1">Peminjaman Tidak Ditemukan</h3>
              <p className="text-sm text-slate-500">
                Periksa kembali ID peminjaman Anda dan coba lagi
              </p>
            </CardContent>
          </Card>
        )}
        
        {!reservation && !notFound && !isSearching && (
          <Card className="border-0 shadow-sm">
            <CardContent className="text-center py-12">
              <FileSearch className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500">
                Masukkan ID peminjaman dan klik "Lacak" untuk melihat status
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {actionDialog.reservation && (
        <ExtendReleaseForm
          reservation={actionDialog.reservation}
          type={actionDialog.type}
          open={actionDialog.open}
          onClose={() => setActionDialog({ open: false, type: null, reservation: null })}
          onSubmit={handleExtendReleaseSubmit}
          existingReservations={allReservations}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}