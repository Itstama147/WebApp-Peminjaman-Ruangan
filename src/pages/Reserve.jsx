import React, { useState, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient'; // Change base44 to supabase
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Copy, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import ReservationForm from "@/components/reservation/ReservationForm";
import { findConflicts, checkDuplicateRequest } from "@/components/reservation/ConflictChecker";

function generateReservationId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'RES-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function Reserve() {
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReservation, setSubmittedReservation] = useState(null);
  
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedRoom = urlParams.get('room');
  
  useEffect(() => {
    loadData();
  }, []);
  
    const loadData = async () => {
    setIsLoading(true);
    // Fetch rooms and reservations simultaneously from Supabase
    const [roomsRes, reservationsRes] = await Promise.all([
      supabase.from('Room').select('*'),
      supabase.from('Reservation').select('*')
    ]);

    setRooms(roomsRes.data || []);
    setReservations(reservationsRes.data || []);
    setIsLoading(false);
  };
  
  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    
    // 1. Fresh data check from Supabase before submission
    const { data: latestReservations } = await supabase
      .from('Reservation')
      .select('*');
    
    // 2. Check for duplicates/conflicts (Keeping your existing logic)
    const duplicate = checkDuplicateRequest(formData, latestReservations);
    if (duplicate) {
      toast.error("Pengajuan peminjaman yang sama sudah pernah dikirim");
      setReservations(latestReservations);
      setIsSubmitting(false);
      return;
    }
    
    const conflicts = findConflicts(formData, latestReservations);
    if (conflicts.length > 0) {
      toast.error("Ruangan sudah digunakan pada waktu tersebut.");
      setReservations(latestReservations);
      setIsSubmitting(false);
      return;
    }
    
    // 3. Prepare Data
    const reservationId = generateReservationId();
    const reservationData = {
      ...formData,
      reservation_id: reservationId,
      status: "pending"
    };
    
    // 4. Insert into Supabase 'Reservation' table
    const { error: resError } = await supabase
      .from('Reservation')
      .insert([reservationData]);

    if (resError) {
      toast.error("Gagal menyimpan reservasi: " + resError.message);
      setIsSubmitting(false);
      return;
    }
    
    // 5. Log the activity in 'ActivityLog' table
    await supabase.from('ActivityLog').insert([{
      action: "reservation_created",
      reservation_id: reservationId,
      room_id: formData.room_id,
      details: `Peminjaman ${reservationId} dibuat untuk ${formData.room_name} oleh ${formData.borrower_name}`,
      actor_name: formData.borrower_name
    }]);
    
    setSubmittedReservation({ ...reservationData });
    setIsSubmitting(false);
    toast.success("Peminjaman berhasil diajukan!");
  };
    
  
  const copyReservationId = () => {
    navigator.clipboard.writeText(submittedReservation.reservation_id);
    toast.success("ID Peminjaman disalin");
  };
  
  if (submittedReservation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Card className="border-0 shadow-2xl bg-white overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-8 text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Peminjaman Terkirim!</h2>
              <p className="text-emerald-100">Permintaan Anda sedang menunggu persetujuan</p>
            </div>
            
            <CardContent className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-500 mb-1">ID Peminjaman Anda</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-slate-900 tracking-wide">
                    {submittedReservation.reservation_id}
                  </span>
                  <Button variant="ghost" size="sm" onClick={copyReservationId}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Ruangan</span>
                  <span className="font-medium text-slate-800">{submittedReservation.room_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Tanggal</span>
                  <span className="font-medium text-slate-800">{submittedReservation.reservation_date}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Waktu</span>
                  <span className="font-medium text-slate-800">{submittedReservation.start_time} - {submittedReservation.end_time}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Status</span>
                  <span className="font-medium text-amber-600">Menunggu Persetujuan</span>
                </div>
              </div>
              
              <p className="text-xs text-slate-400 text-center">
                Simpan ID Peminjaman untuk melacak status permintaan Anda
              </p>
              
              <div className="flex gap-3 pt-4">
                <Link to={createPageUrl("TrackStatus")} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Lacak Status
                  </Button>
                </Link>
                <Link to={createPageUrl("Home")} className="flex-1">
                  <Button className="w-full bg-slate-900 hover:bg-slate-800">
                    Selesai
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to={createPageUrl("RoomList")} className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali ke Daftar Ruangan
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Ajukan Peminjaman</h1>
          <p className="text-slate-500 mt-1">Isi detail untuk mengajukan peminjaman ruangan</p>
        </div>
        
        <ReservationForm 
          rooms={rooms}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          preselectedRoom={preselectedRoom}
          existingReservations={reservations}
        />
      </div>
    </div>
  );
}