import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Crear usuario demo si no existe
    const existingUsers = JSON.parse(localStorage.getItem('cryptoinvest_users') || '[]');
    const exists = existingUsers.some(u => u.email === 'fernandosalinas2008@gmail.com');

    if (!exists) {
      existingUsers.push({
        id: 'demo-user-1',
        name: 'Fernando Salinas',
        email: 'fernandosalinas2008@gmail.com',
        password: 'felipelucinda1916',
        balance: 14351.43,
        eth: 0.000001,
        practiceBalance: 10000,
        depositAddress: '0xBAeaDE80A2A1064E4F8f372cd2ADA9a00daB4BBE',
        role: 'user',
        referralCode: 'FER123',
        referredBy: null,
        createdAt: new Date().toISOString()
      });

      localStorage.setItem('cryptoinvest_users', JSON.stringify(existingUsers));

      // Historial simulado de los últimos 90 días
      const generateHistory = () => {
        const items = [];
        const now = new Date();
        const tipos = ['trade', 'plan', 'bot'];
        const assets = ['BTC', 'ETH', 'USDC'];

        for (let i = 0; i < 30; i++) {
          const date = new Date(now);
          date.setDate(now.getDate() - Math.floor(Math.random() * 90));
          const tipo = tipos[Math.floor(Math.random() * tipos.length)];
          const asset = assets[Math.floor(Math.random() * assets.length)];
          items.push({
            id: `${tipo}-${i}`,
            type: tipo,
            asset,
            amount: parseFloat((Math.random() * 500 + 20).toFixed(2)),
            date: date.toISOString(),
            status: 'completed',
            description:
              tipo === 'trade'
                ? `Trade ejecutado con ${asset}`
                : tipo === 'plan'
                ? `Plan de inversión ${asset}`
                : `Bot automatizado con ${asset}`,
          });
        }

        return items.sort((a, b) => new Date(b.date) - new Date(a.date));
      };

      localStorage.setItem('cryptoinvest_user_history', JSON.stringify({
        userId: 'demo-user-1',
        email: 'fernandosalinas2008@gmail.com',
        movements: generateHistory(),
      }));
    }

    const storedUser = localStorage.getItem('cryptoinvest_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const users = JSON.parse(localStorage.getItem('cryptoinvest_users') || '[]');
      const foundUser = users.find(u => u.email === email && u.password === password);

      if (!foundUser) {
        throw new Error('Credenciales inválidas');
      }

      const userData = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role || 'user',
        balance: foundUser.balance || 0,
        eth: foundUser.eth || 0,
        practiceBalance: foundUser.practiceBalance || 0,
        depositAddress: foundUser.depositAddress || '0xBAeaDE80A2A1064E4F8f372cd2ADA9a00daB4BBE',
        referralCode: foundUser.referralCode,
        referredBy: foundUser.referredBy,
        createdAt: foundUser.createdAt
      };

      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('cryptoinvest_user', JSON.stringify(userData));

      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión exitosamente",
      });

      return userData;
    } catch (error) {
      toast({
        title: "Error de autenticación",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const users = JSON.parse(localStorage.getItem('cryptoinvest_users') || '[]');

      if (users.find(u => u.email === userData.email)) {
        throw new Error('El email ya está registrado');
      }

      const newUser = {
        id: Date.now().toString(),
        ...userData,
        balance: 0,
        eth: 0,
        practiceBalance: 10000,
        role: 'user',
        depositAddress: '0xBAeaDE80A2A1064E4F8f372cd2ADA9a00daB4BBE',
        referralCode: generateReferralCode(),
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('cryptoinvest_users', JSON.stringify(users));

      if (userData.referredBy) {
        const referrer = users.find(u => u.referralCode === userData.referredBy);
        if (referrer) {
          referrer.balance += 50;
          localStorage.setItem('cryptoinvest_users', JSON.stringify(users));
        }
      }

      const userForAuth = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        balance: newUser.balance,
        eth: newUser.eth,
        practiceBalance: newUser.practiceBalance,
        depositAddress: newUser.depositAddress,
        referralCode: newUser.referralCode,
        referredBy: newUser.referredBy,
        createdAt: newUser.createdAt
      };

      setUser(userForAuth);
      setIsAuthenticated(true);
      localStorage.setItem('cryptoinvest_user', JSON.stringify(userForAuth));

      toast({
        title: "¡Registro exitoso!",
        description: "Tu cuenta ha sido creada correctamente",
      });

      return userForAuth;
    } catch (error) {
      toast({
        title: "Error de registro",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('cryptoinvest_user');
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente",
    });
  };

  const updateUser = (updatedData) => {
    const newUserData = { ...user, ...updatedData };
    setUser(newUserData);
    localStorage.setItem('cryptoinvest_user', JSON.stringify(newUserData));

    const users = JSON.parse(localStorage.getItem('cryptoinvest_users') || '[]');
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updatedData };
      localStorage.setItem('cryptoinvest_users', JSON.stringify(users));
    }
  };

  const generateReferralCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
