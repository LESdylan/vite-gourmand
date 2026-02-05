import React, { useState } from 'react';
import { Lock, Mail, User, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import type { Page } from '../App';

type LoginPageProps = {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onSignup: (formData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
  }) => Promise<boolean>;
  onResetPassword: (email: string) => Promise<boolean>;
  setCurrentPage: (page: Page) => void;
};

export default function LoginPage({ onLogin, onSignup, onResetPassword, setCurrentPage }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'reset'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup form
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupAddress, setSignupAddress] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Reset form
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const validatePassword = (password: string): boolean => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
    if (!regex.test(password)) {
      setPasswordError(
        'Le mot de passe doit contenir au minimum 10 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)'
      );
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    await onLogin(loginEmail, loginPassword);
    setLoginLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword(signupPassword)) {
      return;
    }

    setSignupLoading(true);
    const success = await onSignup({
      email: signupEmail,
      password: signupPassword,
      firstName: signupFirstName,
      lastName: signupLastName,
      phone: signupPhone,
      address: signupAddress,
    });
    
    if (success) {
      // Clear form and switch to login tab
      setSignupEmail('');
      setSignupPassword('');
      setSignupFirstName('');
      setSignupLastName('');
      setSignupPhone('');
      setSignupAddress('');
      setActiveTab('login');
    }
    
    setSignupLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    const success = await onResetPassword(resetEmail);
    if (success) {
      setResetEmail('');
      setActiveTab('login');
    }
    setResetLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Connexion</h1>
          <p className="text-gray-600">
            Connectez-vous ou créez un compte pour commander
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Inscription</TabsTrigger>
            <TabsTrigger value="reset">Mot de passe</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Se connecter</CardTitle>
                <CardDescription>
                  Entrez vos identifiants pour accéder à votre compte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Adresse email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="votre@email.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••••"
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    disabled={loginLoading}
                  >
                    {loginLoading ? 'Connexion...' : 'Se connecter'}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setActiveTab('reset')}
                      className="text-sm text-orange-600 hover:text-orange-700"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signup Tab */}
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Créer un compte</CardTitle>
                <CardDescription>
                  Remplissez les informations ci-dessous pour créer votre compte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="signup-firstname">Prénom</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-firstname"
                          type="text"
                          value={signupFirstName}
                          onChange={(e) => setSignupFirstName(e.target.value)}
                          placeholder="Julie"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="signup-lastname">Nom</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-lastname"
                          type="text"
                          value={signupLastName}
                          onChange={(e) => setSignupLastName(e.target.value)}
                          placeholder="Dupont"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-email">Adresse email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="votre@email.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-phone">Numéro de téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-phone"
                        type="tel"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        placeholder="06 XX XX XX XX"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-address">Adresse postale</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-address"
                        type="text"
                        value={signupAddress}
                        onChange={(e) => setSignupAddress(e.target.value)}
                        placeholder="123 Rue Example, 33000 Bordeaux"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={signupPassword}
                        onChange={(e) => {
                          setSignupPassword(e.target.value);
                          if (passwordError) validatePassword(e.target.value);
                        }}
                        placeholder="••••••••••"
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordError && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription className="text-sm">
                          {passwordError}
                        </AlertDescription>
                      </Alert>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 10 caractères avec majuscule, minuscule, chiffre et caractère spécial
                    </p>
                  </div>

                  <Alert>
                    <AlertDescription className="text-xs">
                      En créant un compte, vous acceptez nos conditions générales et notre politique de confidentialité (RGPD).
                    </AlertDescription>
                  </Alert>

                  <Button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    disabled={signupLoading}
                  >
                    {signupLoading ? 'Création...' : 'Créer mon compte'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reset Password Tab */}
          <TabsContent value="reset">
            <Card>
              <CardHeader>
                <CardTitle>Réinitialiser le mot de passe</CardTitle>
                <CardDescription>
                  Entrez votre adresse email pour recevoir un lien de réinitialisation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleReset} className="space-y-4">
                  <div>
                    <Label htmlFor="reset-email">Adresse email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="reset-email"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="votre@email.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    disabled={resetLoading}
                  >
                    {resetLoading ? 'Envoi...' : 'Envoyer le lien'}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="text-sm text-orange-600 hover:text-orange-700"
                    >
                      Retour à la connexion
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center">
          <button
            onClick={() => setCurrentPage({ type: 'home' })}
            className="text-gray-600 hover:text-orange-600 text-sm"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
