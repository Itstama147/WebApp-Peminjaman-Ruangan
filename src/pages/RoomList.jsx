import React, { useState, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Building2, Calendar, ArrowLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RoomCard from "@/components/rooms/RoomCard";
import RoomStatusFilter from "@/components/rooms/RoomStatusFilter";

export default function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    loadRooms();

    const channel = supabase
      .channel('room-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Room' }, (payload) => {
        loadRooms(); // Just reload everything when a change happens
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const loadRooms = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('Room') // Matches the table name we just created
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error("Error:", error.message);
    } else {
      setRooms(data || []);
    }
    setIsLoading(false);
  };
  
  const filteredRooms = rooms.filter(room => {
    const matchesFilter = filter === "all" || room.status === filter;
    const matchesSearch = room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.building?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.type?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  
  const statusCounts = {
    all: rooms.length,
    available: rooms.filter(r => r.status === "available").length,
    in_use: rooms.filter(r => r.status === "in_use").length,
    unavailable: rooms.filter(r => r.status === "unavailable").length
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link to={createPageUrl("Home")} className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Kembali ke Beranda
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Semua Ruangan</h1>
            <p className="text-slate-500 mt-1">
              {statusCounts.available} dari {statusCounts.all} ruangan tersedia
            </p>
          </div>
          <Link to={createPageUrl("Reserve")}>
            <Button className="bg-slate-900 hover:bg-slate-800 h-11">
              <Calendar className="w-4 h-4 mr-2" />
              Ajukan Peminjaman
            </Button>
          </Link>
        </div>
        
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Cari ruangan berdasarkan nama, gedung, atau tipe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-white border-slate-200"
            />
          </div>
          <RoomStatusFilter activeFilter={filter} onFilterChange={setFilter} />
        </div>
        
        {/* Room Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">Ruangan tidak ditemukan</h3>
            <p className="text-slate-400">Coba ubah pencarian atau filter</p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredRooms.map((room, idx) => (
                <motion.div
                  key={room.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <RoomCard room={room} onClick={() => {
                    if (room.status !== "unavailable") {
                      window.location.href = createPageUrl(`Reserve?room=${room.id}`);
                    }
                  }} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}