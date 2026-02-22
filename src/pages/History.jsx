import React, { useState, useEffect } from 'react';
import { supabase } from "@/api/supabaseClient"; // ADD THIS
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, Loader2, FileText } from "lucide-react";
import { motion } from "framer-motion";
import ReservationCard from "@/components/reservation/ReservationCard";

export default function History() {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    loadReservations();
  }, []);
  
  const loadReservations = async () => {
    const data = await base44.entities.Reservation.list('-created_date');
    setReservations(data);
    setIsLoading(false);
  };
  
  const filteredReservations = reservations.filter(res => {
    const matchesStatus = statusFilter === "all" || res.status === statusFilter;
    const matchesSearch = 
      res.reservation_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.borrower_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.room_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to={createPageUrl("Home")} className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali ke Beranda
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Riwayat Peminjaman</h1>
          <p className="text-slate-500 mt-1">Lihat semua riwayat peminjaman ruangan</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Cari berdasarkan ID, nama, atau ruangan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-white"
            />
          </div>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="h-11 bg-white border">
              <TabsTrigger value="all">Semua</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Disetujui</TabsTrigger>
              <TabsTrigger value="rejected">Ditolak</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Reservation List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">Tidak ada peminjaman</h3>
            <p className="text-slate-400">
              {reservations.length === 0 
                ? "Belum ada peminjaman yang dibuat"
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
                <ReservationCard reservation={reservation} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}