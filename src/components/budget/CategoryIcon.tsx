'use client'

import type { LucideIcon } from 'lucide-react'
import {
  Baby,
  Briefcase,
  Car,
  CircleDollarSign,
  Droplets,
  Fuel,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  Music,
  Package,
  PawPrint,
  Phone,
  RotateCcw,
  Shield,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Tv,
  UtensilsCrossed,
  Wifi,
  Zap,
} from 'lucide-react'

const MAP: Record<string, LucideIcon> = {
  Baby,
  Briefcase,
  Car,
  CircleDollarSign,
  Droplets,
  Fuel,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  Music,
  Package,
  PawPrint,
  Phone,
  RotateCcw,
  Shield,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Tv,
  UtensilsCrossed,
  Wifi,
  Zap,
}

interface Props {
  name: string
  size?: number
  color?: string
  strokeWidth?: number
}

export default function CategoryIcon({ name, size = 16, color, strokeWidth = 2 }: Props) {
  const Icon = MAP[name] ?? Package
  return <Icon size={size} color={color} strokeWidth={strokeWidth} />
}
