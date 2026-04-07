import { 
  Smartphone, 
  Home, 
  Shirt, 
  Dumbbell, 
  Sparkles, 
  Baby, 
  PawPrint, 
  Briefcase, 
  Car, 
  Package,
  LucideIcon
} from 'lucide-react';

const iconosMap: Record<string, LucideIcon> = {
  'Smartphone': Smartphone,
  'Home': Home,
  'Shirt': Shirt,
  'Dumbbell': Dumbbell,
  'Sparkles': Sparkles,
  'Baby': Baby,
  'PawPrint': PawPrint,
  'Briefcase': Briefcase,
  'Car': Car,
  'Package': Package,
};

interface IconoCategoriaProps {
  icono: string;
  className?: string;
}

export default function IconoCategoria({ icono, className = "h-5 w-5" }: IconoCategoriaProps) {
  const IconComponent = iconosMap[icono] || Package;
  return <IconComponent className={className} />;
}

export { iconosMap };
