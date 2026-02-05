import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Clock, FileText, MessageSquare, Eye, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const DAYS = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' }
];

interface Review {
  id: string;
  userName: string;
  rating: number;
  text: string;
  validated: boolean;
  createdAt: string;
}

export default function ContentManagementSystem() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('hours');

  // Opening hours state
  const [openingHours, setOpeningHours] = useState<any>({});
  const [hoursLoading, setHoursLoading] = useState(true);

  // Site content state
  const [siteContent, setSiteContent] = useState({
    companyName: '',
    tagline: '',
    aboutText: '',
    contactEmail: '',
    contactPhone: '',
    address: ''
  });
  const [contentLoading, setContentLoading] = useState(true);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    fetchOpeningHours();
    fetchSiteContent();
    fetchReviews();
  }, []);

  const fetchOpeningHours = async () => {
    setHoursLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/opening-hours`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOpeningHours(data.hours);
      }
    } catch (error) {
      console.error('Error fetching opening hours:', error);
      toast.error('Erreur lors du chargement des horaires');
    } finally {
      setHoursLoading(false);
    }
  };

  const saveOpeningHours = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/opening-hours`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ hours: openingHours })
        }
      );

      if (response.ok) {
        toast.success('Horaires mis à jour avec succès');
      } else {
        toast.error('Erreur lors de la mise à jour des horaires');
      }
    } catch (error) {
      console.error('Error saving opening hours:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const fetchSiteContent = async () => {
    setContentLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/site-content`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSiteContent(data.content);
      }
    } catch (error) {
      console.error('Error fetching site content:', error);
      toast.error('Erreur lors du chargement du contenu');
    } finally {
      setContentLoading(false);
    }
  };

  const saveSiteContent = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/site-content`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content: siteContent })
        }
      );

      if (response.ok) {
        toast.success('Contenu mis à jour avec succès');
      } else {
        toast.error('Erreur lors de la mise à jour du contenu');
      }
    } catch (error) {
      console.error('Error saving site content:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/reviews/all`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Erreur lors du chargement des avis');
    } finally {
      setReviewsLoading(false);
    }
  };

  const validateReview = async (reviewId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/reviews/${reviewId}/validate`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        }
      );

      if (response.ok) {
        toast.success('Avis validé avec succès');
        fetchReviews();
      } else {
        toast.error('Erreur lors de la validation');
      }
    } catch (error) {
      console.error('Error validating review:', error);
      toast.error('Erreur lors de la validation');
    }
  };

  const invalidateReview = async (reviewId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/reviews/${reviewId}/invalidate`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        }
      );

      if (response.ok) {
        toast.success('Avis invalidé');
        fetchReviews();
      } else {
        toast.error('Erreur lors de l\'invalidation');
      }
    } catch (error) {
      console.error('Error invalidating review:', error);
      toast.error('Erreur lors de l\'invalidation');
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/reviews/${reviewId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        }
      );

      if (response.ok) {
        toast.success('Avis supprimé');
        fetchReviews();
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const updateDayHours = (day: string, field: string, value: any) => {
    setOpeningHours({
      ...openingHours,
      [day]: {
        ...openingHours[day],
        [field]: value
      }
    });
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="h-8 w-8 text-orange-600" />
            Gestion du Contenu du Site
          </h1>
          <p className="text-gray-600 mt-2">
            Modifiez les horaires d'ouverture, le contenu du site et validez les avis clients
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="hours">
              <Clock className="h-4 w-4 mr-2" />
              Horaires d'ouverture
            </TabsTrigger>
            <TabsTrigger value="content">
              <FileText className="h-4 w-4 mr-2" />
              Contenu du site
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <MessageSquare className="h-4 w-4 mr-2" />
              Avis clients
              {reviews.filter(r => !r.validated).length > 0 && (
                <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {reviews.filter(r => !r.validated).length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Opening Hours Tab */}
          <TabsContent value="hours">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Horaires d'ouverture
                </CardTitle>
                <CardDescription>
                  Définissez vos horaires d'ouverture pour chaque jour de la semaine
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hoursLoading ? (
                  <div className="py-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {DAYS.map(day => (
                      <div key={day.key} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-32 font-medium text-gray-900">{day.label}</div>
                        <div className="flex items-center gap-2 flex-1">
                          <Switch
                            checked={!openingHours[day.key]?.closed}
                            onCheckedChange={(checked) => 
                              updateDayHours(day.key, 'closed', !checked)
                            }
                          />
                          {openingHours[day.key]?.closed ? (
                            <span className="text-gray-500 italic">Fermé</span>
                          ) : (
                            <>
                              <Input
                                type="time"
                                value={openingHours[day.key]?.open || '08:00'}
                                onChange={(e) => updateDayHours(day.key, 'open', e.target.value)}
                                className="w-32"
                              />
                              <span className="text-gray-600">à</span>
                              <Input
                                type="time"
                                value={openingHours[day.key]?.close || '18:00'}
                                onChange={(e) => updateDayHours(day.key, 'close', e.target.value)}
                                className="w-32"
                              />
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    <Button
                      onClick={saveOpeningHours}
                      disabled={loading}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Enregistrement...' : 'Enregistrer les horaires'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Site Content Tab */}
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Contenu du site web</CardTitle>
                <CardDescription>
                  Modifiez les textes et informations affichés sur le site
                </CardDescription>
              </CardHeader>
              <CardContent>
                {contentLoading ? (
                  <div className="py-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="companyName">Nom de l'entreprise</Label>
                      <Input
                        id="companyName"
                        value={siteContent.companyName}
                        onChange={(e) => setSiteContent({ ...siteContent, companyName: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="tagline">Slogan</Label>
                      <Input
                        id="tagline"
                        value={siteContent.tagline}
                        onChange={(e) => setSiteContent({ ...siteContent, tagline: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="aboutText">Texte "À propos"</Label>
                      <Textarea
                        id="aboutText"
                        value={siteContent.aboutText}
                        onChange={(e) => setSiteContent({ ...siteContent, aboutText: e.target.value })}
                        rows={6}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contactEmail">Email de contact</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={siteContent.contactEmail}
                          onChange={(e) => setSiteContent({ ...siteContent, contactEmail: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="contactPhone">Téléphone</Label>
                        <Input
                          id="contactPhone"
                          value={siteContent.contactPhone}
                          onChange={(e) => setSiteContent({ ...siteContent, contactPhone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Adresse</Label>
                      <Input
                        id="address"
                        value={siteContent.address}
                        onChange={(e) => setSiteContent({ ...siteContent, address: e.target.value })}
                      />
                    </div>

                    <Button
                      onClick={saveSiteContent}
                      disabled={loading}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Enregistrement...' : 'Enregistrer le contenu'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="space-y-4">
              {/* Pending Reviews */}
              {reviews.filter(r => !r.validated).length > 0 && (
                <Card className="border-orange-300 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-900">
                      <AlertCircle className="h-5 w-5" />
                      Avis en attente de validation ({reviews.filter(r => !r.validated).length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {reviews
                      .filter(r => !r.validated)
                      .map(review => (
                        <Card key={review.id} className="bg-white">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-semibold">{review.userName}</span>
                                  <div className="flex">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <span key={i} className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}>
                                        ★
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <p className="text-gray-700 mb-2">{review.text}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Button
                                  onClick={() => validateReview(review.id)}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Valider
                                </Button>
                                <Button
                                  onClick={() => deleteReview(review.id)}
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600"
                                >
                                  Supprimer
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </CardContent>
                </Card>
              )}

              {/* Validated Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle>Avis validés ({reviews.filter(r => r.validated).length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {reviewsLoading ? (
                    <div className="py-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    </div>
                  ) : reviews.filter(r => r.validated).length === 0 ? (
                    <p className="text-center text-gray-600 py-8">Aucun avis validé</p>
                  ) : (
                    <div className="space-y-4">
                      {reviews
                        .filter(r => r.validated)
                        .map(review => (
                          <Card key={review.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-semibold">{review.userName}</span>
                                    <div className="flex">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <span key={i} className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}>
                                          ★
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-gray-700 mb-2">{review.text}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                                  </p>
                                </div>
                                <div className="flex gap-2 ml-4">
                                  <Button
                                    onClick={() => invalidateReview(review.id)}
                                    size="sm"
                                    variant="outline"
                                  >
                                    Masquer
                                  </Button>
                                  <Button
                                    onClick={() => deleteReview(review.id)}
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600"
                                  >
                                    Supprimer
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
