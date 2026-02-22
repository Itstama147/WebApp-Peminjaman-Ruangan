import React, { useState, useEffect } from 'react';
import { supabase } from "@/api/supabaseClient"; // ADD THIS
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, Activity, Loader2, Search, Calendar, 
  PlusCircle, CheckCircle2, XCircle, Settings
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const actionConfig = {
  reservation_created: { 
    icon: PlusCircle, 
    label: "Peminjaman Dibuat", 
    color: "bg-blue-100 text-blue-700" 
  },
  reservation_approved: { 
    icon: CheckCircle2, 
    label: "Peminjaman Disetujui", 
    color: "bg-emerald-100 text-emerald-700" 
  },
  reservation_rejected: { 
    icon: XCircle, 
    label: "Peminjaman Ditolak", 
    color: "bg-red-100 text-red-700" 
  },
  room_status_changed: { 
    icon: Settings, 
    label: "Ruangan Diperbarui", 
    color: "bg-slate-100 text-slate-700" 
  }
};

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    loadLogs();
  }, []);
  
  const loadLogs = async () => {
    const data = await base44.entities.ActivityLog.list('-created_date', 100);
    setLogs(data);
    setIsLoading(false);
  };
  
  const filteredLogs = logs.filter(log => 
    log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.reservation_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.actor_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to={createPageUrl("AdminDashboard")} className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali ke Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Log Aktivitas</h1>
              <p className="text-slate-500 text-sm">Pantau semua aktivitas sistem</p>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Cari log..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-white"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <Activity className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">Belum ada log aktivitas</h3>
            <p className="text-slate-400">Aktivitas akan muncul di sini saat pengguna membuat peminjaman</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => {
              const config = actionConfig[log.action] || actionConfig.room_status_changed;
              const Icon = config.icon;
              
              return (
                <Card key={log.id} className="border-0 shadow-sm bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${config.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                          <Badge className={`${config.color} border-0 font-normal`}>
                            {config.label}
                          </Badge>
                          <span className="text-xs text-slate-400 flex items-center gap-1 flex-shrink-0">
                            <Calendar className="w-3 h-3" />
                            {log.created_date ? format(new Date(log.created_date), "d MMM yyyy HH:mm", { locale: id }) : "-"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 mt-2">{log.details}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          {log.reservation_id && (
                            <span>ID: {log.reservation_id}</span>
                          )}
                          {log.actor_name && (
                            <span>Oleh: {log.actor_name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}