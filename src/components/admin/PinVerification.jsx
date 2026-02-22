import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_PIN = "1234"; // Default PIN - can be changed

export default function PinVerification({ onVerified }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showPin, setShowPin] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isLocked) return;
    
    if (pin === ADMIN_PIN) {
      setError("");
      onVerified();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setIsLocked(true);
        setError("Too many failed attempts. Access blocked for 30 seconds.");
        setTimeout(() => {
          setIsLocked(false);
          setAttempts(0);
          setError("");
        }, 30000);
      } else {
        setError(`Incorrect PIN. ${3 - newAttempts} attempts remaining.`);
      }
      setPin("");
    }
  };
  
  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPin(value);
    if (error && !isLocked) setError("");
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
          <CardHeader className="text-center pb-2">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Admin Access</CardTitle>
            <p className="text-slate-500 text-sm mt-1">Enter your PIN to access the dashboard</p>
          </CardHeader>
          
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type={showPin ? "text" : "password"}
                  placeholder="Enter PIN"
                  value={pin}
                  onChange={handlePinChange}
                  disabled={isLocked}
                  className="pl-10 pr-10 h-14 text-center text-2xl tracking-[0.5em] font-mono"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      isLocked ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <Button
                type="submit"
                disabled={pin.length < 4 || isLocked}
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium"
              >
                {isLocked ? "Access Blocked" : "Verify PIN"}
              </Button>
            </form>
            
            <p className="text-center text-xs text-slate-400 mt-6">
              SUPERDUPER Admin Panel • Authorized Personnel Only
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}