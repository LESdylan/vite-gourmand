import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Users, Search, Eye, Award, Package, Gift, TrendingUp } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { motion } from 'motion/react';

interface User {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  role: 'user' | 'employee' | 'admin' | 'customer';
  points: number;
  totalOrders: number;
  affiliateCode: string;
  isAffiliate: boolean;
  totalSavings: number;
  createdAt: string;
  created_at: string;
}

interface UserManagementProps {
  userRole: 'admin' | 'employee';
  accessToken: string | null;
}

export default function UserManagementComplete({ userRole, accessToken }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'employee' | 'admin' | 'customer'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log('[UserManagement] Fetching users...');
      const authHeader = accessToken ? `Bearer ${accessToken}` : `Bearer ${publicAnonKey}`;
      console.log('[UserManagement] Using auth:', accessToken ? 'accessToken' : 'publicAnonKey');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e87bab51/admin/users`,
        {
          headers: {
            'Authorization': authHeader,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('[UserManagement] Users loaded:', data.users);
        setUsers(data.users || []);
      } else {
        console.error('[UserManagement] Error response:', response.status);
        toast.error('Erreur lors du chargement des utilisateurs');
      }
    } catch (error) {
      console.error('[UserManagement] Error fetching users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'employee':
        return 'bg-blue-100 text-blue-800';
      case 'customer':
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'employee':
        return 'Employé';
      case 'customer':
      case 'user':
        return 'Client';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
            <p className="text-gray-600">Chargement des utilisateurs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-orange-600" />
                Gestion des utilisateurs
              </CardTitle>
              <CardDescription className="mt-2">
                {filteredUsers.length} utilisateur(s) • Total des points distribués: {users.reduce((sum, u) => sum + (u.points || 0), 0)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher par nom, prénom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'customer', 'employee', 'admin'].map((role) => (
                <Button
                  key={role}
                  variant={filterRole === role ? 'default' : 'outline'}
                  onClick={() => setFilterRole(role as any)}
                  size="sm"
                >
                  {role === 'all' ? 'Tous' : getRoleLabel(role)}
                </Button>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Clients</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {users.filter(u => u.role === 'user' || u.role === 'customer').length}
                    </p>
                  </div>
                  <Users className="h-10 w-10 text-blue-400 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Points totaux</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {users.reduce((sum, u) => sum + (u.points || 0), 0)}
                    </p>
                  </div>
                  <Award className="h-10 w-10 text-orange-400 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Affiliés actifs</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {users.filter(u => u.isAffiliate).length}
                    </p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-purple-400 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Commandes</p>
                    <p className="text-2xl font-bold text-green-900">
                      {users.reduce((sum, u) => sum + (u.totalOrders || 0), 0)}
                    </p>
                  </div>
                  <Package className="h-10 w-10 text-green-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users List */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id || user.userId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
                          </div>
                          
                          {/* User Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">
                                {user.firstName} {user.lastName}
                              </h3>
                              <Badge className={getRoleColor(user.role)}>
                                {getRoleLabel(user.role)}
                              </Badge>
                              {user.isAffiliate && (
                                <Badge className="bg-purple-100 text-purple-800">
                                  <Users className="h-3 w-3 mr-1" />
                                  Affilié
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            {user.phone && (
                              <p className="text-xs text-gray-500">{user.phone}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Stats */}
                        <div className="flex items-center gap-6 text-center mr-6">
                          <div>
                            <div className="flex items-center gap-1">
                              <Award className="h-4 w-4 text-orange-600" />
                              <span className="text-xl font-bold text-orange-600">{user.points || 0}</span>
                            </div>
                            <div className="text-xs text-gray-600">Points</div>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-1">
                              <Package className="h-4 w-4 text-blue-600" />
                              <span className="text-xl font-bold text-blue-600">{user.totalOrders || 0}</span>
                            </div>
                            <div className="text-xs text-gray-600">Commandes</div>
                          </div>
                          
                          {user.isAffiliate && user.totalSavings > 0 && (
                            <div>
                              <div className="flex items-center gap-1">
                                <Gift className="h-4 w-4 text-green-600" />
                                <span className="text-xl font-bold text-green-600">{user.totalSavings}€</span>
                              </div>
                              <div className="text-xs text-gray-600">Gains</div>
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Détails
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      {selectedUser && (
        <Dialog open={showUserDetail} onOpenChange={setShowUserDetail}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Profil utilisateur</DialogTitle>
              <DialogDescription>
                Informations détaillées et statistiques
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* User Header */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                  {selectedUser.firstName?.[0]?.toUpperCase()}{selectedUser.lastName?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold">{selectedUser.firstName} {selectedUser.lastName}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getRoleColor(selectedUser.role)}>
                      {getRoleLabel(selectedUser.role)}
                    </Badge>
                    {selectedUser.isAffiliate && (
                      <Badge className="bg-purple-100 text-purple-800">
                        Programme affilié
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-orange-50">
                  <CardContent className="p-4 text-center">
                    <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-orange-600">{selectedUser.points || 0}</div>
                    <div className="text-sm text-gray-600">Points fidélité</div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50">
                  <CardContent className="p-4 text-center">
                    <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-blue-600">{selectedUser.totalOrders || 0}</div>
                    <div className="text-sm text-gray-600">Commandes</div>
                  </CardContent>
                </Card>

                {selectedUser.isAffiliate && (
                  <>
                    <Card className="bg-green-50">
                      <CardContent className="p-4 text-center">
                        <Gift className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-green-600">{selectedUser.totalSavings || 0}€</div>
                        <div className="text-sm text-gray-600">Gains affiliation</div>
                      </CardContent>
                    </Card>

                    <Card className="bg-purple-50">
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-lg font-bold text-purple-600 font-mono">{selectedUser.affiliateCode}</div>
                        <div className="text-sm text-gray-600">Code affilié</div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations de contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-gray-600">Email</Label>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  {selectedUser.phone && (
                    <div>
                      <Label className="text-gray-600">Téléphone</Label>
                      <p className="font-medium">{selectedUser.phone}</p>
                    </div>
                  )}
                  {selectedUser.address && (
                    <div>
                      <Label className="text-gray-600">Adresse</Label>
                      <p className="font-medium">{selectedUser.address}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-gray-600">Date d'inscription</Label>
                    <p className="font-medium">
                      {new Date(selectedUser.createdAt || selectedUser.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Affiliate Info */}
              {selectedUser.isAffiliate && (
                <Card className="bg-purple-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      Programme d'affiliation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white rounded">
                        <span className="text-gray-600">Code de parrainage</span>
                        <span className="font-mono font-bold text-lg">{selectedUser.affiliateCode}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded">
                        <span className="text-gray-600">Gains totaux</span>
                        <span className="font-bold text-green-600 text-lg">{selectedUser.totalSavings || 0}€</span>
                      </div>
                      <p className="text-sm text-gray-600 italic">
                        L'affilié gagne 10% du montant de chaque commande de ses filleuls
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUserDetail(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
