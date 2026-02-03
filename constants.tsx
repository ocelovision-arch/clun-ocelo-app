
import { Product, User, AppConfig } from './types';

export const INITIAL_CONFIG: AppConfig = {
  primaryColor: '#001B3D', 
  accentColor: '#FF4D00',  
  logoUrl: 'https://picsum.photos/seed/ocelo/200/200',
  systemGuide: 'Bienvenido al sistema de fidelización de Ocelo Vision. Por cada compra que realices, acumulas el 5% del valor en puntos. Los puntos tienen una vigencia de 365 días.',
  redeemConditions: 'Los puntos pueden ser canjeados por cualquier producto disponible en nuestra óptica.',
  currency: 'ARS',
  language: 'Español',
  pointExpiryDays: 365,
  pointsPerArs: 0.05
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Classic Noir Shade',
    category: 'Sol',
    price: 45900,
    stock: 24,
    imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=400',
    description: 'Edición original de Ocelo con protección UV400.'
  },
  {
    id: '2',
    name: 'Aviation Gold',
    category: 'Sol',
    price: 62150,
    stock: 3,
    imageUrl: 'https://images.unsplash.com/photo-1511499767390-90342f16bca4?auto=format&fit=crop&q=80&w=400',
    description: 'Marcos dorados premium con lentes degradados.'
  }
];

export const MOCK_CUSTOMERS: User[] = [
  {
    id: 'user_sandra',
    name: 'Sandra Brander',
    email: 'sandra@ocelo.com',
    password: 'sandraocelo',
    phone: '+54 9 11 9999-8888',
    referralCode: 'SANDRA-OCELO',
    totalPoints: 10000,
    history: [],
    pointsDetail: [],
    referrals: []
  },
  {
    id: 'user_1',
    name: 'Mariana Rodriguez',
    email: 'marian@ocelo.com',
    password: 'user123',
    phone: '+54 9 11 5555-4444',
    referralCode: 'OCELO-MARI-2024',
    totalPoints: 16450,
    history: [],
    pointsDetail: [],
    referrals: ['user_2']
  },
  {
    id: 'user_2',
    name: 'Juan Alvarez',
    email: 'juan@ocelo.com',
    password: 'user123',
    phone: '+54 9 11 2233-4455',
    referralCode: 'OCELO-JUAN-11',
    totalPoints: 2100,
    history: [],
    pointsDetail: [],
    referrals: []
  }
];
