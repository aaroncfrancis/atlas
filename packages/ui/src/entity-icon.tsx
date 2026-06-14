import {
  Banknote,
  Car,
  Cat,
  CircleDot,
  CreditCard,
  Dog,
  HeartPulse,
  Home,
  Landmark,
  type LucideIcon,
  PawPrint,
  Repeat,
  Shield,
  Wallet,
} from "lucide-react-native";
import type { EntityType } from "@atlas/core";

// Resolve an entity's Lucide icon (CLAUDE.md §6: `entities.icon` stores a Lucide
// name). We match the stored name first, then fall back by entity type, then to a
// neutral dot — so an unknown icon never crashes the row.
const BY_NAME: Record<string, LucideIcon> = {
  home: Home,
  car: Car,
  dog: Dog,
  cat: Cat,
  pawprint: PawPrint,
  repeat: Repeat,
  wallet: Wallet,
  creditcard: CreditCard,
  landmark: Landmark,
  banknote: Banknote,
  shield: Shield,
  heartpulse: HeartPulse,
};

const BY_TYPE: Record<EntityType, LucideIcon> = {
  home: Home,
  car: Car,
  pet: PawPrint,
  subscription: Repeat,
  account: Wallet,
  bank: Landmark,
  insurance: Shield,
  health: HeartPulse,
};

export interface EntityIconProps {
  icon?: string | null;
  type?: EntityType | null;
  color: string;
  size?: number;
}

export function EntityIcon({ icon, type, color, size = 18 }: EntityIconProps) {
  const Icon =
    (icon ? BY_NAME[icon.toLowerCase()] : undefined) ??
    (type ? BY_TYPE[type] : undefined) ??
    CircleDot;
  return <Icon size={size} color={color} strokeWidth={2} />;
}
