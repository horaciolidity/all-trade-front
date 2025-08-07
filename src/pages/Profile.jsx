import React from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { User, Bell, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PersonalInfoTab from '@/components/profile/PersonalInfoTab';
import SecurityTab from '@/components/profile/SecurityTab';
import NotificationsTab from '@/components/profile/NotificationsTab';
import PreferencesTab from '@/components/profile/PreferencesTab';
import { useAuth } from '@/contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  const isFernando = user?.email === 'fernandosalinas2008@gmail.com';

  // Datos predeterminados para Fernando
  const displayName = isFernando ? 'Fernando Salinas' : user?.name || 'Usuario';
  const displayEmail = isFernando ? 'fernandosalinas2008@gmail.com' : user?.email;
  const displayBalance = isFernando ? 14251.43 : (user?.balance || 0);
  const displayAddress = isFernando
    ? 'Cra. 15 #45-67, Chapinero, Bogotá, Colombia'
    : user?.address || 'No especificada';
  const displayPhone = isFernando
    ? `+57 ${Math.floor(3000000000 + Math.random() * 99999999)}`
    : user?.phone || 'No especificado';

  // Avatar generado simple para Fernando
  const avatarUrl = isFernando
    ? 'https://ui-avatars.com/api/?name=Fernando+Salinas&background=0D8ABC&color=fff&size=128'
    : null;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Mi Perfil</h1>
          <p className="text-slate-300">Gestiona tu información personal y configuración de seguridad</p>
        </motion.div>

        {/* Tarjeta de perfil */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <Card className="crypto-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-20 h-20 rounded-full border-2 border-slate-700 object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {displayName[0] || <User className="h-10 w-10" />}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">{displayName}</h2>
                  <p className="text-slate-300">{displayEmail}</p>
                  {isFernando && (
                    <>
                      <p className="text-slate-400 text-sm">{displayAddress}</p>
                      <p className="text-slate-400 text-sm">{displayPhone}</p>
                    </>
                  )}
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                      Cuenta Verificada
                    </span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                      Usuario
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm">Saldo actual</p>
                  <p className="text-2xl font-bold text-green-400">
                    ${displayBalance.toFixed(2)} USDC
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-slate-800">
              <TabsTrigger value="personal" className="text-white">
                <User className="h-4 w-4 mr-2 sm:hidden md:inline-block" /> Personal
              </TabsTrigger>
              <TabsTrigger value="security" className="text-white">
                <Shield className="h-4 w-4 mr-2 sm:hidden md:inline-block" /> Seguridad
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-white">
                <Bell className="h-4 w-4 mr-2 sm:hidden md:inline-block" /> Notificaciones
              </TabsTrigger>
              <TabsTrigger value="preferences" className="text-white">
                Preferencias
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <PersonalInfoTab />
            </TabsContent>
            <TabsContent value="security">
              <SecurityTab />
            </TabsContent>
            <TabsContent value="notifications">
              <NotificationsTab />
            </TabsContent>
            <TabsContent value="preferences">
              <PreferencesTab />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Profile;
