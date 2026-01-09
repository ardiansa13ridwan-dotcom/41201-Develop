
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Truck,
  ArrowDownCircle, 
  ArrowUpCircle, 
  AlertTriangle, 
  FileText,
  Users as UsersIcon,
  Database
} from 'lucide-react';
import { InventoryItem, UnitType, UserAccount, Room, Supplier } from './types';

export const NAVIGATION_ITEMS = [
  { id: 'DASHBOARD', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'MASTER', label: 'Master Barang', icon: <Package className="w-5 h-5" /> },
  { id: 'SUPPLIERS', label: 'Master Supplier', icon: <Truck className="w-5 h-5" /> },
  { id: 'INBOUND', label: 'Barang Masuk', icon: <ArrowDownCircle className="w-5 h-5" /> },
  { id: 'OUTBOUND', label: 'Barang Keluar', icon: <ArrowUpCircle className="w-5 h-5" /> },
  { id: 'ALERTS', label: 'Peringatan', icon: <AlertTriangle className="w-5 h-5" /> },
  { id: 'REPORTS', label: 'Laporan', icon: <FileText className="w-5 h-5" /> },
  { id: 'USERS', label: 'Master User', icon: <UsersIcon className="w-5 h-5" /> },
  { id: 'SYSTEM', label: 'Sistem & Backup', icon: <Database className="w-5 h-5" /> },
] as const;

// Mempertahankan user admin agar bisa login pertama kali
export const MOCK_USERS: UserAccount[] = [
  { id: 'u1', username: 'admin', password: '123', fullName: 'Staff Gudang', role: 'STAFF', room: Room.GUDANG },
];

// Dikosongkan agar user bisa input data riil
export const MOCK_SUPPLIERS: Supplier[] = [];

// Dikosongkan agar user bisa input data riil
export const MOCK_ITEMS: InventoryItem[] = [];
