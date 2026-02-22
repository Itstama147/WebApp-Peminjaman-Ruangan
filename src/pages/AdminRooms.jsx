import React, { useState, useEffect } from 'react';
import { supabase } from "@/api/supabaseClient"; // ADD THIS
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, Plus, Pencil, Trash2, Building2, Loader2, Save, X
} from "lucide-react";
import { toast } from "sonner";

const roomTypes = [
  { value: "classroom", label: "Ruang Kelas" },
  { value: "lab", label: "Laboratorium" },
  { value: "meeting_room", label: "Ruang Rapat" },
  { value: "auditorium", label: "Auditorium" },
  { value: "sports_hall", label: "Aula Olahraga" },
  { value: "library", label: "Perpustakaan" }
];

const statusOptions = [
  { value: "available", label: "Tersedia", color: "bg-emerald-100 text-emerald-700" },
  { value: "in_use", label: "Sedang Digunakan", color: "bg-amber-100 text-amber-700" },
  { value: "unavailable", label: "Tidak Tersedia", color: "bg-slate-100 text-slate-700" }
];

const initialFormState = {
  name: "",
  building: "",
  capacity: "",
  type: "classroom",
  status: "available",
  image_url: "",
  facilities: []
};

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, room: null });
  const [facilityInput, setFacilityInput] = useState("");
  
  useEffect(() => {
    loadRooms();
  }, []);
  
  const loadRooms = async () => {
    const data = await base44.entities.Room.list();
    setRooms(data);
    setIsLoading(false);
  };
  
  const openAddDialog = () => {
    setEditingRoom(null);
    setFormData(initialFormState);
    setDialogOpen(true);
  };
  
  const openEditDialog = (room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name || "",
      building: room.building || "",
      capacity: room.capacity || "",
      type: room.type || "classroom",
      status: room.status || "available",
      image_url: room.image_url || "",
      facilities: room.facilities || []
    });
    setDialogOpen(true);
  };
  
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Nama ruangan wajib diisi");
      return;
    }
    
    setIsSaving(true);
    
    const roomData = {
      ...formData,
      capacity: formData.capacity ? parseInt(formData.capacity) : null
    };
    
    if (editingRoom) {
      await base44.entities.Room.update(editingRoom.id, roomData);
      
      await base44.entities.ActivityLog.create({
        action: "room_status_changed",
        room_id: editingRoom.id,
        details: `Ruangan "${formData.name}" diperbarui`,
        actor_name: "Admin"
      });
      
      toast.success("Ruangan berhasil diperbarui");
    } else {
      await base44.entities.Room.create(roomData);
      toast.success("Ruangan berhasil ditambahkan");
    }
    
    setDialogOpen(false);
    setIsSaving(false);
    loadRooms();
  };
  
  const handleDelete = async () => {
    const { room } = deleteDialog;
    await base44.entities.Room.delete(room.id);
    toast.success("Ruangan berhasil dihapus");
    setDeleteDialog({ open: false, room: null });
    loadRooms();
  };
  
  const addFacility = () => {
    if (facilityInput.trim() && !formData.facilities.includes(facilityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        facilities: [...prev.facilities, facilityInput.trim()]
      }));
      setFacilityInput("");
    }
  };
  
  const removeFacility = (facility) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.filter(f => f !== facility)
    }));
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link to={createPageUrl("AdminDashboard")} className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Kembali ke Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Kelola Ruangan</h1>
            <p className="text-slate-500 text-sm">Tambah, edit, atau hapus ruangan</p>
          </div>
          <Button onClick={openAddDialog} className="bg-slate-900 hover:bg-slate-800">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Ruangan
          </Button>
        </div>
        
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-20">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">Belum ada ruangan</h3>
                <p className="text-slate-400 mb-4">Tambahkan ruangan pertama untuk memulai</p>
                <Button onClick={openAddDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Ruangan
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Nama Ruangan</TableHead>
                    <TableHead>Gedung</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Kapasitas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => {
                    const status = statusOptions.find(s => s.value === room.status) || statusOptions[0];
                    const type = roomTypes.find(t => t.value === room.type);
                    return (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium">{room.name}</TableCell>
                        <TableCell>{room.building || "-"}</TableCell>
                        <TableCell>{type?.label || room.type}</TableCell>
                        <TableCell>{room.capacity || "-"}</TableCell>
                        <TableCell>
                          <Badge className={`${status.color} border-0`}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(room)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setDeleteDialog({ open: true, room })}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRoom ? "Edit Ruangan" : "Tambah Ruangan Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Ruangan *</Label>
                <Input
                  placeholder="Contoh: Ruang 101"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Gedung</Label>
                <Input
                  placeholder="Contoh: Gedung A"
                  value={formData.building}
                  onChange={(e) => setFormData(prev => ({ ...prev, building: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipe Ruangan</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, type: val }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kapasitas</Label>
                <Input
                  type="number"
                  placeholder="Contoh: 30"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>URL Gambar</Label>
              <Input
                placeholder="https://..."
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Fasilitas</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Contoh: Proyektor, AC"
                  value={facilityInput}
                  onChange={(e) => setFacilityInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFacility())}
                />
                <Button type="button" variant="outline" onClick={addFacility}>
                  Tambah
                </Button>
              </div>
              {formData.facilities.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.facilities.map((facility, idx) => (
                    <Badge key={idx} variant="secondary" className="pl-2 pr-1 py-1">
                      {facility}
                      <button onClick={() => removeFacility(facility)} className="ml-1 hover:text-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-slate-900 hover:bg-slate-800">
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editingRoom ? "Perbarui" : "Simpan"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, room: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Ruangan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus "{deleteDialog.room?.name}"? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, room: null })}>
              Batal
            </Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}