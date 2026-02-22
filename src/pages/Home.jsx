import React, { useState, useEffect } from 'react';
import { supabase } from "@/api/supabaseClient"; // ADD THIS
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Building2, Calendar, ClipboardCheck, History, 
  ArrowRight, Search, Shield, Clock, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { 
    icon: Building2, 
    title: "Lihat Ruangan", 
    description: "Daftar ruangan dengan status real-time",
    link: "RoomList",
    color: "from-blue-500 to-blue-600"
  },
  { 
    icon: Calendar, 
    title: "Ajukan Peminjaman", 
    description: "Booking ruangan dengan cepat dan mudah",
    link: "Reserve",
    color: "from-emerald-500 to-emerald-600"
  },
  { 
    icon: Search, 
    title: "Lacak Status", 
    description: "Cek status persetujuan peminjaman",
    link: "TrackStatus",
    color: "from-amber-500 to-amber-600"
  },
  { 
    icon: History, 
    title: "Riwayat", 
    description: "Lihat semua riwayat peminjaman",
    link: "History",
    color: "from-purple-500 to-purple-600"
  }
];

const stats = [
  { label: "Ruangan Aktif", value: "12+", icon: Building2 },
  { label: "Booking Cepat", value: "5mnt", icon: Clock },
  { label: "Bebas Bentrok", value: "100%", icon: Sparkles }
];

export default function Home() {
  const [roomStats, setRoomStats] = useState({ available: 0, total: 0 });
  
  useEffect(() => {
    const loadStats = async () => {
      const rooms = await base44.entities.Room.list();
      setRoomStats({
        total: rooms.length,
        available: rooms.filter(r => r.status === "available").length
      });
    };
    loadStats();
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80')] bg-cover bg-center opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/5 to-white" />
        
        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-sm font-medium text-slate-600 mb-6">
              <Building2 className="w-4 h-4" />
              Sistem Peminjaman Ruangan Sekolah
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4 tracking-tight">
              SUPERDUPER
            </h1>
            <p className="text-lg md:text-xl text-slate-500 mb-2 font-medium">
              School Unified Platform for Efficient Digital Usage & Room Reservation
            </p>
            
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Booking ruangan kelas, lab, dan ruang rapat dengan mudah. 
              Tanpa perlu akun — langsung ajukan dan gunakan.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("Reserve")}>
                <Button size="lg" className="h-14 px-8 text-base bg-slate-900 hover:bg-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <Calendar className="w-5 h-5 mr-2" />
                  Ajukan Peminjaman
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl("RoomList")}>
                <Button size="lg" variant="outline" className="h-14 px-8 text-base border-slate-300 hover:bg-slate-50">
                  <Building2 className="w-5 h-5 mr-2" />
                  Lihat Semua Ruangan
                </Button>
              </Link>
            </div>
          </motion.div>
          
          {/* Quick Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 grid grid-cols-3 gap-4 max-w-xl mx-auto"
          >
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="text-center p-4 bg-white/80 backdrop-blur rounded-2xl shadow-sm">
                  <Icon className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
      
      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Cara Penggunaan</h2>
          <p className="text-slate-600">Langkah mudah untuk meminjam ruangan</p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * idx }}
              >
                <Link to={createPageUrl(feature.link)}>
                  <Card className="group h-full border-0 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden bg-white">
                    <CardContent className="p-6">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="mt-4 flex items-center text-sm font-medium text-slate-400 group-hover:text-blue-600 transition-colors">
                        Mulai
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Admin Access */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-900 to-slate-800 text-white overflow-hidden">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/10 rounded-2xl">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Panel Admin</h3>
                  <p className="text-slate-300 text-sm">Kelola peminjaman, setujui permintaan, dan pantau aktivitas</p>
                </div>
              </div>
              <Link to={createPageUrl("AdminDashboard")}>
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 shadow-lg">
                  <ClipboardCheck className="w-5 h-5 mr-2" />
                  Buka Panel Admin
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}