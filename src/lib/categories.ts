import {
  Recycle,
  FileText,
  Package,
  Wine,
  Drumstick,
  Apple,
  Cpu,
  Trash2,
  type LucideIcon,
} from 'lucide-react';

export type WasteCategory = {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string; // hex for canvas + charts
  recyclable: boolean;
  description: string;
  co2PerKg: number; // kg CO2 saved per kg recycled
  examples: string[];
};

export const CATEGORIES: WasteCategory[] = [
  {
    key: 'plastic',
    label: 'Plastic',
    icon: Recycle,
    color: '#3b82f6',
    recyclable: true,
    description: 'Bottles, containers, packaging film and other polymer waste.',
    co2PerKg: 1.5,
    examples: ['PET bottles', 'Food containers', 'Plastic bags', 'Packaging'],
  },
  {
    key: 'paper',
    label: 'Paper',
    icon: FileText,
    color: '#f59e0b',
    recyclable: true,
    description: 'Office paper, newspapers, magazines and printed material.',
    co2PerKg: 1.3,
    examples: ['Newspaper', 'Office paper', 'Magazines', 'Notebooks'],
  },
  {
    key: 'cardboard',
    label: 'Cardboard',
    icon: Package,
    color: '#b45309',
    recyclable: true,
    description: 'Corrugated boxes, cartons and heavy paper packaging.',
    co2PerKg: 1.1,
    examples: ['Shipping boxes', 'Cartons', 'Cardboard tubes'],
  },
  {
    key: 'glass',
    label: 'Glass',
    icon: Wine,
    color: '#10b981',
    recyclable: true,
    description: 'Bottles, jars and other clear or coloured glass containers.',
    co2PerKg: 0.9,
    examples: ['Glass bottles', 'Jars', 'Glassware'],
  },
  {
    key: 'metal',
    label: 'Metal',
    icon: Drumstick,
    color: '#64748b',
    recyclable: true,
    description: 'Aluminium cans, steel tins and other metallic waste.',
    co2PerKg: 4.0,
    examples: ['Aluminium cans', 'Steel tins', 'Foil', 'Scrap metal'],
  },
  {
    key: 'organic',
    label: 'Organic Waste',
    icon: Apple,
    color: '#22c55e',
    recyclable: true,
    description: 'Food scraps and biodegradable matter for composting.',
    co2PerKg: 0.4,
    examples: ['Food scraps', 'Peels', 'Tea bags', 'Garden trimmings'],
  },
  {
    key: 'ewaste',
    label: 'E-Waste',
    icon: Cpu,
    color: '#8b5cf6',
    recyclable: true,
    description: 'Electronic devices, cables and components needing special handling.',
    co2PerKg: 2.7,
    examples: ['Phones', 'Cables', 'Batteries', 'Circuit boards'],
  },
  {
    key: 'other',
    label: 'Other Waste',
    icon: Trash2,
    color: '#ef4444',
    recyclable: false,
    description: 'Non-recyclable mixed waste destined for landfill.',
    co2PerKg: 0,
    examples: ['Mixed waste', 'Sanitary items', 'Contaminated material'],
  },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c]),
) as Record<string, WasteCategory>;

export function getCategory(key: string): WasteCategory {
  return CATEGORY_MAP[key] ?? CATEGORIES[CATEGORIES.length - 1];
}

export const RECYCLABLE_KEYS = CATEGORIES.filter((c) => c.recyclable).map((c) => c.key);
