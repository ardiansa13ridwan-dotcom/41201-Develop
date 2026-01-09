
export enum UnitType {
  KARTON = 'Karton',
  BOX = 'Box',
  PCS = 'Pcs',
  KIT = 'Kit',
  PACK = 'Pack',
  BOTOL = 'Botol'
}

export enum Room {
  KASIR = 'Ruang Kasir',
  PROSES = 'Ruang Proses',
  PHLEBOTOMIST = 'Ruang Phlebotomist',
  RADIOLOGI = 'Ruang Radiologi',
  ADMIN = 'Ruang Admin',
  ADMIN_KEUANGAN = 'Ruang Admin Keuangan',
  BM = 'Ruang BM',
  OB = 'Ruang OB',
  GUDANG = 'Gudang Maxima Palu'
}

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: 'ADMIN' | 'STAFF';
  room: Room;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  lotNumber: string;
  unit: UnitType;
  stock: number;
  minStock: number;
  expiryDate: string;
  lastUpdated: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  address: string;
}

export interface Transaction {
  id: string;
  itemId: string;
  itemName: string;
  lotNumber: string;
  type: 'IN' | 'OUT';
  quantity: number;
  unit: UnitType;
  date: string;
  destination?: Room;
  requester?: string;
  supplier?: string;
}

export type View = 'DASHBOARD' | 'MASTER' | 'SUPPLIERS' | 'INBOUND' | 'OUTBOUND' | 'ALERTS' | 'REPORTS' | 'USERS' | 'SYSTEM';
