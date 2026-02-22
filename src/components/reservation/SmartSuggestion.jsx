import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Building2, Clock, ArrowRight } from "lucide-react";

export default function SmartSuggestion({ 
  alternativeRooms = [], 
  alternativeSlots = [], 
  roomName = "",
  onSelectRoom,
  onSelectSlot 
}) {
  if (alternativeRooms.length === 0 && alternativeSlots.length === 0) {
    return null;
  }
  
  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-amber-600" />
          <span className="font-medium text-amber-800">Rekomendasi Alternatif</span>
        </div>
        
        {alternativeRooms.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-amber-700 mb-2">Ruangan lain yang tersedia:</p>
            <div className="flex flex-wrap gap-2">
              {alternativeRooms.slice(0, 3).map((room) => (
                <Button
                  key={room.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectRoom?.(room)}
                  className="border-amber-300 bg-white hover:bg-amber-100"
                >
                  <Building2 className="w-3 h-3 mr-1" />
                  {room.name}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {alternativeSlots.length > 0 && (
          <div>
            <p className="text-sm text-amber-700 mb-2">
              Waktu tersedia untuk {roomName}:
            </p>
            <div className="flex flex-wrap gap-2">
              {alternativeSlots.map((slot, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectSlot?.(slot)}
                  className="border-amber-300 bg-white hover:bg-amber-100"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  {slot.start_time} - {slot.end_time}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}