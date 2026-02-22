import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Clock, User, Building2, FileText, Send, Loader2, AlertTriangle, Copy } from "lucide-react";
import { format } from "date-fns";
import { 
  findConflicts, 
  formatConflictMessage, 
  checkDuplicateRequest,
  findAvailableRooms,
  findAvailableTimeSlots
} from "./ConflictChecker";
import SmartSuggestion from "./SmartSuggestion";

export default function ReservationForm({ rooms, onSubmit, isSubmitting, existingReservations, preselectedRoom }) {
  const [formData, setFormData] = useState({
    borrower_name: "",
    class_unit: "",
    room_id: "",
    reservation_date: "",
    start_time: "",
    end_time: "",
    purpose: ""
  });
  
  const [errors, setErrors] = useState({});
  const [conflictWarning, setConflictWarning] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [alternativeRooms, setAlternativeRooms] = useState([]);
  const [alternativeSlots, setAlternativeSlots] = useState([]);
  
  const availableRooms = rooms.filter(room => room.status !== "unavailable");
  
  // Check for conflicts and duplicates
  useEffect(() => {
    if (formData.room_id && formData.reservation_date && formData.start_time && formData.end_time) {
      // Check conflicts
      const conflicts = findConflicts(formData, existingReservations);
      if (conflicts.length > 0) {
        setConflictWarning(formatConflictMessage(conflicts));
        
        // Find alternatives
        const altRooms = findAvailableRooms(
          formData.reservation_date, 
          formData.start_time, 
          formData.end_time, 
          rooms, 
          existingReservations, 
          formData.room_id
        );
        setAlternativeRooms(altRooms);
        
        const altSlots = findAvailableTimeSlots(
          formData.room_id, 
          formData.reservation_date, 
          existingReservations
        );
        setAlternativeSlots(altSlots);
      } else {
        setConflictWarning(null);
        setAlternativeRooms([]);
        setAlternativeSlots([]);
      }
      
      // Check duplicates
      if (formData.borrower_name) {
        const duplicate = checkDuplicateRequest(formData, existingReservations);
        if (duplicate) {
          setDuplicateWarning(`Pengajuan peminjaman yang sama sudah pernah dikirim (ID: ${duplicate.reservation_id})`);
        } else {
          setDuplicateWarning(null);
        }
      }
    } else {
      setConflictWarning(null);
      setDuplicateWarning(null);
      setAlternativeRooms([]);
      setAlternativeSlots([]);
    }
  }, [formData, existingReservations, rooms]);
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.borrower_name.trim()) newErrors.borrower_name = "Nama peminjam wajib diisi";
    if (!formData.class_unit.trim()) newErrors.class_unit = "Kelas/Unit wajib diisi";
    if (!formData.room_id) newErrors.room_id = "Pilih ruangan";
    if (!formData.reservation_date) newErrors.reservation_date = "Tanggal wajib diisi";
    if (!formData.start_time) newErrors.start_time = "Jam mulai wajib diisi";
    if (!formData.end_time) newErrors.end_time = "Jam selesai wajib diisi";
    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      newErrors.end_time = "Jam selesai harus setelah jam mulai";
    }
    if (!formData.purpose.trim()) newErrors.purpose = "Keperluan wajib diisi";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (conflictWarning || duplicateWarning) return;
    
    if (validateForm()) {
      const selectedRoom = rooms.find(r => r.id === formData.room_id);
      onSubmit({
        ...formData,
        room_name: selectedRoom?.name || ""
      });
    }
  };
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  const handleSelectAlternativeRoom = (room) => {
    handleChange("room_id", room.id);
  };
  
  const handleSelectAlternativeSlot = (slot) => {
    setFormData(prev => ({
      ...prev,
      start_time: slot.start_time,
      end_time: slot.end_time
    }));
  };
  
  const today = format(new Date(), "yyyy-MM-dd");
  const selectedRoom = rooms.find(r => r.id === formData.room_id);
  
  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-slate-800">Detail Peminjaman</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                Nama Peminjam
              </Label>
              <Input
                placeholder="Masukkan nama lengkap"
                value={formData.borrower_name}
                onChange={(e) => handleChange("borrower_name", e.target.value)}
                className={`h-11 ${errors.borrower_name ? "border-red-400 focus:ring-red-400" : ""}`}
              />
              {errors.borrower_name && <p className="text-xs text-red-500">{errors.borrower_name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Kelas / Unit
              </Label>
              <Input
                placeholder="Contoh: Kelas 10A, Bagian Kesiswaan"
                value={formData.class_unit}
                onChange={(e) => handleChange("class_unit", e.target.value)}
                className={`h-11 ${errors.class_unit ? "border-red-400 focus:ring-red-400" : ""}`}
              />
              {errors.class_unit && <p className="text-xs text-red-500">{errors.class_unit}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Pilih Ruangan</Label>
            <Select value={formData.room_id} onValueChange={(val) => handleChange("room_id", val)}>
              <SelectTrigger className={`h-11 ${errors.room_id ? "border-red-400" : ""}`}>
                <SelectValue placeholder="Pilih ruangan yang tersedia" />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.length === 0 ? (
                  <SelectItem value="none" disabled>Tidak ada ruangan tersedia</SelectItem>
                ) : (
                  availableRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name} - {room.building || "Utama"} ({room.capacity || 30} kursi)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.room_id && <p className="text-xs text-red-500">{errors.room_id}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tanggal
              </Label>
              <Input
                type="date"
                min={today}
                value={formData.reservation_date}
                onChange={(e) => handleChange("reservation_date", e.target.value)}
                className={`h-11 ${errors.reservation_date ? "border-red-400" : ""}`}
              />
              {errors.reservation_date && <p className="text-xs text-red-500">{errors.reservation_date}</p>}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Jam Mulai
              </Label>
              <Input
                type="time"
                value={formData.start_time}
                onChange={(e) => handleChange("start_time", e.target.value)}
                className={`h-11 ${errors.start_time ? "border-red-400" : ""}`}
              />
              {errors.start_time && <p className="text-xs text-red-500">{errors.start_time}</p>}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Jam Selesai
              </Label>
              <Input
                type="time"
                value={formData.end_time}
                onChange={(e) => handleChange("end_time", e.target.value)}
                className={`h-11 ${errors.end_time ? "border-red-400" : ""}`}
              />
              {errors.end_time && <p className="text-xs text-red-500">{errors.end_time}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Keperluan Penggunaan
            </Label>
            <Textarea
              placeholder="Jelaskan keperluan peminjaman ruangan..."
              value={formData.purpose}
              onChange={(e) => handleChange("purpose", e.target.value)}
              className={`min-h-[100px] resize-none ${errors.purpose ? "border-red-400" : ""}`}
            />
            {errors.purpose && <p className="text-xs text-red-500">{errors.purpose}</p>}
          </div>
          
          {duplicateWarning && (
            <Alert variant="destructive" className="bg-orange-50 border-orange-200">
              <Copy className="h-4 w-4" />
              <AlertDescription className="text-orange-700">
                <strong>Duplikat Terdeteksi:</strong> {duplicateWarning}
              </AlertDescription>
            </Alert>
          )}
          
          {conflictWarning && (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-700">
                <strong>Jadwal Bentrok:</strong> {conflictWarning}
              </AlertDescription>
            </Alert>
          )}
          
          {(alternativeRooms.length > 0 || alternativeSlots.length > 0) && (
            <SmartSuggestion
              alternativeRooms={alternativeRooms}
              alternativeSlots={alternativeSlots}
              roomName={selectedRoom?.name}
              onSelectRoom={handleSelectAlternativeRoom}
              onSelectSlot={handleSelectAlternativeSlot}
            />
          )}
          
          <Button
            type="submit"
            disabled={isSubmitting || availableRooms.length === 0 || !!conflictWarning || !!duplicateWarning}
            className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Ajukan Peminjaman
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}