import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin } from "lucide-react";

const statusConfig = {
  available: { label: "Tersedia", color: "bg-emerald-500", textColor: "text-emerald-700", bgLight: "bg-emerald-50" },
  in_use: { label: "Sedang Digunakan", color: "bg-amber-500", textColor: "text-amber-700", bgLight: "bg-amber-50" },
  unavailable: { label: "Tidak Tersedia", color: "bg-slate-400", textColor: "text-slate-600", bgLight: "bg-slate-50" }
};

const typeLabels = {
  classroom: "Ruang Kelas",
  lab: "Laboratorium",
  meeting_room: "Ruang Rapat",
  auditorium: "Auditorium",
  sports_hall: "Aula Olahraga",
  library: "Perpustakaan"
};

export default function RoomCard({ room, onClick }) {
  const status = statusConfig[room.status] || statusConfig.available;
  
  return (
    <Card 
      className="group cursor-pointer overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500 bg-white"
      onClick={() => onClick?.(room)}
    >
      <div className="relative h-40 overflow-hidden">
        <img 
          src={room.image_url || `https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=300&fit=crop`}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 right-3">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${status.bgLight} backdrop-blur-sm`}>
            <div className={`w-2 h-2 rounded-full ${status.color} animate-pulse`} />
            <span className={`text-xs font-medium ${status.textColor}`}>{status.label}</span>
          </div>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-semibold text-lg truncate">{room.name}</h3>
          <p className="text-white/80 text-sm">{typeLabels[room.type] || room.type}</p>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>{room.building || "Gedung Utama"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>{room.capacity || 30} kursi</span>
          </div>
        </div>
        
        {room.facilities && room.facilities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {room.facilities.slice(0, 3).map((facility, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs font-normal bg-slate-100 text-slate-600">
                {facility}
              </Badge>
            ))}
            {room.facilities.length > 3 && (
              <Badge variant="secondary" className="text-xs font-normal bg-slate-100 text-slate-600">
                +{room.facilities.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}