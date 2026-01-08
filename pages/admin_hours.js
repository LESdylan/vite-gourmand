import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Clock, Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const days = [
  { key: 'lundi', label: 'Lundi' },
  { key: 'mardi', label: 'Mardi' },
  { key: 'mercredi', label: 'Mercredi' },
  { key: 'jeudi', label: 'Jeudi' },
  { key: 'vendredi', label: 'Vendredi' },
  { key: 'samedi', label: 'Samedi' },
  { key: 'dimanche', label: 'Dimanche' },
];

const defaultHours = {
  lundi: { is_open: true, open_time: '09:00', close_time: '18:00' },
  mardi: { is_open: true, open_time: '09:00', close_time: '18:00' },
  mercredi: { is_open: true, open_time: '09:00', close_time: '18:00' },
  jeudi: { is_open: true, open_time: '09:00', close_time: '18:00' },
  vendredi: { is_open: true, open_time: '09:00', close_time: '18:00' },
  samedi: { is_open: true, open_time: '09:00', close_time: '12:00' },
  dimanche: { is_open: false, open_time: '', close_time: '' },
};

export default function AdminHours() {
  const [hours, setHours] = useState({});
  const [hoursRecords, setHoursRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadHours();
  }, []);

  const loadHours = async () => {
    try {
      const user = await base44.auth.me();
      if (user.role !== 'admin' && user.role !== 'employe') {
        window.location.href = createPageUrl('Home');
        return;
      }
      
      const data = await base44.entities.BusinessHours.list();
      const hoursMap = {};
      const recordsMap = {};
      
      data.forEach(h => {
        hoursMap[h.day] = {
          is_open: h.is_open,
          open_time: h.open_time || '',
          close_time: h.close_time || '',
        };
        recordsMap[h.day] = h.id;
      });

      // Fill with defaults if not exist
      days.forEach(d => {
        if (!hoursMap[d.key]) {
          hoursMap[d.key] = defaultHours[d.key];
        }
      });

      setHours(hoursMap);
      setHoursRecords(recordsMap);
    } catch (e) {
      console.error('Erreur:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const day of days) {
        const hourData = hours[day.key];
        const existingId = hoursRecords[day.key];

        if (existingId) {
          await base44.entities.BusinessHours.update(existingId, {
            day: day.key,
            is_open: hourData.is_open,
            open_time: hourData.open_time,
            close_time: hourData.close_time,
          });
        } else {
          const newRecord = await base44.entities.BusinessHours.create({
            day: day.key,
            is_open: hourData.is_open,
            open_time: hourData.open_time,
            close_time: hourData.close_time,
          });
          setHoursRecords(prev => ({ ...prev, [day.key]: newRecord.id }));
        }
      }
    } catch (e) {
      console.error('Erreur:', e);
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const updateHour = (day, field, value) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#722F37]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('AdminDashboard')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#2C2C2C]">Horaires d'ouverture</h1>
              <p className="text-[#2C2C2C]/60">Gérez vos horaires de travail</p>
            </div>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-[#722F37] hover:bg-[#8B4049]"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Enregistrer
          </Button>
        </div>

        {/* Hours Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#722F37]" />
              Horaires par jour
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {days.map((day, index) => (
              <motion.div
                key={day.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-4 rounded-lg ${
                  hours[day.key]?.is_open ? 'bg-green-50' : 'bg-gray-50'
                }`}
              >
                <div className="w-24">
                  <span className="font-medium text-[#2C2C2C]">{day.label}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={hours[day.key]?.is_open || false}
                    onCheckedChange={(v) => updateHour(day.key, 'is_open', v)}
                  />
                  <span className="text-sm text-gray-500 w-16">
                    {hours[day.key]?.is_open ? 'Ouvert' : 'Fermé'}
                  </span>
                </div>

                {hours[day.key]?.is_open && (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="time"
                      value={hours[day.key]?.open_time || ''}
                      onChange={(e) => updateHour(day.key, 'open_time', e.target.value)}
                      className="w-32"
                    />
                    <span className="text-gray-400">à</span>
                    <Input
                      type="time"
                      value={hours[day.key]?.close_time || ''}
                      onChange={(e) => updateHour(day.key, 'close_time', e.target.value)}
                      className="w-32"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}