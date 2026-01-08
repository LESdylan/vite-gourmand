import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, Star, Check, X, Loader2, Filter, MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('en_attente');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const user = await base44.auth.me();
      if (user.role !== 'admin' && user.role !== 'employe') {
        window.location.href = createPageUrl('Home');
        return;
      }
      const data = await base44.entities.Review.list('-created_date');
      setReviews(data);
    } catch (e) {
      console.error('Erreur:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (review) => {
    setUpdating(review.id);
    try {
      await base44.entities.Review.update(review.id, { status: 'approuve' });
      setReviews(reviews.map(r => r.id === review.id ? { ...r, status: 'approuve' } : r));
    } catch (e) {
      console.error('Erreur:', e);
      throw e;
    } finally {
      setUpdating(null);
    }
  };

  const handleReject = async (review) => {
    setUpdating(review.id);
    try {
      await base44.entities.Review.update(review.id, { status: 'refuse' });
      setReviews(reviews.map(r => r.id === review.id ? { ...r, status: 'refuse' } : r));
    } catch (e) {
      console.error('Erreur:', e);
      throw e;
    } finally {
      setUpdating(null);
    }
  };

  const filteredReviews = statusFilter === 'all' 
    ? reviews 
    : reviews.filter(r => r.status === statusFilter);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const statusLabels = {
    en_attente: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
    approuve: { label: 'Approuvé', color: 'bg-green-100 text-green-800' },
    refuse: { label: 'Refusé', color: 'bg-red-100 text-red-800' },
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('AdminDashboard')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#2C2C2C]">Gestion des avis</h1>
              <p className="text-[#2C2C2C]/60">
                {reviews.filter(r => r.status === 'en_attente').length} avis en attente
              </p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les avis</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="approuve">Approuvés</SelectItem>
                  <SelectItem value="refuse">Refusés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-[#2C2C2C] mb-2">
                Aucun avis
              </h3>
              <p className="text-[#2C2C2C]/60">
                {statusFilter === 'en_attente' 
                  ? "Aucun avis en attente de modération"
                  : "Aucun avis avec ce filtre"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-[#722F37] flex items-center justify-center">
                            <span className="text-white font-medium">
                              {review.user_name?.[0]?.toUpperCase() || 'C'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-[#2C2C2C]">{review.user_name}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(review.created_date), 'dd MMMM yyyy', { locale: fr })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-1 mb-3">
                          {renderStars(review.rating)}
                        </div>
                        
                        <p className="text-[#2C2C2C]/80 leading-relaxed">
                          {review.comment || <em className="text-gray-400">Pas de commentaire</em>}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <Badge className={statusLabels[review.status].color}>
                          {statusLabels[review.status].label}
                        </Badge>
                        
                        {review.status === 'en_attente' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(review)}
                              disabled={updating === review.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {updating === review.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(review)}
                              disabled={updating === review.id}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}