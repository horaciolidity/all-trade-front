import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Save, Camera } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useSound } from '@/contexts/SoundContext';

const PersonalInfoTab = () => {
  const { user, updateUser } = useAuth();
  const { playSound } = useSound();

  const isFernando = user?.email === 'fernandosalinas2008@gmail.com';

  // Defaults para Fernando (direccion en Bogotá y teléfono COL)
  const defaults = isFernando
    ? {
        name: 'Fernando Salinas',
        email: 'fernandosalinas2008@gmail.com',
        phone: '+57 310 456 7890',
        country: 'Colombia',
        city: 'Chapinero, Bogotá',
        referralCode: 'FER123',
        avatarUrl:
          'https://ui-avatars.com/api/?name=Fernando+Salinas&background=0D8ABC&color=fff&size=256',
      }
    : {
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        country: user?.country || '',
        city: user?.city || '',
        referralCode: user?.referralCode || '',
        avatarUrl: user?.avatar_url || '',
      };

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    referralCode: '',
    avatarUrl: '',
  });

  // Prefill solo al montar (o si cambia el flag)
  useEffect(() => {
    setProfileData(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFernando]);

  const handleProfileUpdate = () => {
    updateUser(profileData);
    playSound('success');
    toast({
      title: 'Perfil actualizado',
      description: 'Tu información personal ha sido actualizada exitosamente',
    });
  };

  const handleImageUpload = () => {
    playSound('click');
    toast({
      title: 'Función no implementada',
      description:
        '🚧 Aún no implementado. Si querés, puedo guardar este avatar generado por defecto.',
      variant: 'destructive',
    });
  };

  return (
    <Card className="crypto-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <User className="h-5 w-5 mr-2 text-blue-400" />
          Información Personal
        </CardTitle>
        <CardDescription className="text-slate-300">
          Actualiza tu información personal y de contacto.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
              alt="Foto de perfil del usuario"
              src={
                profileData.avatarUrl ||
                'https://ui-avatars.com/api/?name=User&background=475569&color=fff&size=256'
              }
            />
            <Button
              size="icon"
              variant="outline"
              className="absolute -bottom-2 -right-2 p-2 bg-slate-700 hover:bg-slate-600 rounded-full border-slate-500"
              onClick={handleImageUpload}
            >
              <Camera className="h-4 w-4 text-white" />
            </Button>
          </div>
          <div>
            <p className="text-xl font-semibold text-white">{profileData.name || 'Tu nombre'}</p>
            <p className="text-sm text-slate-400">{profileData.email || 'tu@email.com'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-white">Nombre Completo</Label>
            <Input
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Email</Label>
            <Input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              className="bg-slate-800 border-slate-600 text-white"
              disabled={isFernando} // opcional bloquear email
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Teléfono</Label>
            <Input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              placeholder="+57 3xx xxx xxxx"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">País</Label>
            <Input
              value={profileData.country}
              onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
              placeholder="País"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Ciudad</Label>
            <Input
              value={profileData.city}
              onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
              placeholder="Ciudad"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Código de Referido</Label>
            <Input
              value={profileData.referralCode}
              onChange={(e) => setProfileData({ ...profileData, referralCode: e.target.value })}
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
        </div>

        <Button
          onClick={handleProfileUpdate}
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
        >
          <Save className="h-4 w-4 mr-2" />
          Guardar Cambios
        </Button>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoTab;
