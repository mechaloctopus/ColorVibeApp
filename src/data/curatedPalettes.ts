// Curated palette library for Color Trends & Inspiration
// Each category contains at least 5 distinct palettes

export type CuratedCategory = 'seasonal' | 'design' | 'industry' | 'mood' | 'cultural';

export interface CuratedPalette {
  id: string;
  name: string;
  description: string;
  colors: string[]; // 4-6 HEX values
  category: CuratedCategory;
  tags?: string[];
  suggestedApplications?: string[];
  year?: number;
}

// Seasonal
export const SEASONAL_PALETTES: CuratedPalette[] = [
  {
    id: 'spring-bloom',
    name: 'Spring Bloom',
    description: 'Fresh pastels and soft greens for uplifting, airy designs.',
    colors: ['#FDECEF', '#FADADD', '#C1E1C1', '#A7D8DE', '#FFF5CC'],
    category: 'seasonal',
    tags: ['spring', 'pastel', 'fresh'],
    suggestedApplications: ['Brand refresh', 'Wellness', 'Editorial'],
  },
  {
    id: 'summer-citrus',
    name: 'Summer Citrus',
    description: 'Vibrant tropical brights with sunny contrast and cool teal.',
    colors: ['#FF6B35', '#FFE66D', '#4ECDC4', '#1A535C', '#FF9F1C'],
    category: 'seasonal',
    tags: ['summer', 'tropical', 'vibrant'],
    suggestedApplications: ['Campaigns', 'Events', 'Social'],
  },
  {
    id: 'autumn-harvest',
    name: 'Autumn Harvest',
    description: 'Earthy ambers and terracottas for cozy, grounded visuals.',
    colors: ['#8B5E3C', '#D2691E', '#C97D60', '#A0522D', '#F2E8CF'],
    category: 'seasonal',
    tags: ['autumn', 'earthy', 'organic'],
    suggestedApplications: ['Interiors', 'Food', 'Branding'],
  },
  {
    id: 'winter-frost',
    name: 'Winter Frost',
    description: 'Icy blues with warm accent for crisp, modern compositions.',
    colors: ['#E0FBFC', '#98C1D9', '#3D5A80', '#293241', '#EE6C4D'],
    category: 'seasonal',
    tags: ['winter', 'cool', 'crisp'],
    suggestedApplications: ['Tech', 'Editorial', 'Web'],
  },
  {
    id: 'vernal-meadow',
    name: 'Vernal Meadow',
    description: 'Lively greens and butter-yellow for fresh seasonal energy.',
    colors: ['#9BE564', '#5ADBFF', '#84CC16', '#FDE047', '#2563EB'],
    category: 'seasonal',
    tags: ['spring', 'green', 'fresh'],
    suggestedApplications: ['Eco', 'Outdoors', 'Retail'],
  },
];

// Design trends
export const DESIGN_TREND_PALETTES: CuratedPalette[] = [
  {
    id: 'digital-neons-2024',
    name: 'Digital Neons 2024',
    description: 'Vibrant, luminous hues inspired by generative tech aesthetics.',
    colors: ['#22D3EE', '#A78BFA', '#FB7185', '#FBBF24', '#34D399'],
    category: 'design',
    tags: ['2024', 'neon', 'tech'],
    suggestedApplications: ['Landing pages', 'Startups', 'Motion'],
    year: 2024,
  },
  {
    id: 'minimalist-neutrals',
    name: 'Minimalist Neutrals',
    description: 'Human-centered grayscale with clean contrast and clarity.',
    colors: ['#111827', '#374151', '#9CA3AF', '#E5E7EB', '#FFFFFF'],
    category: 'design',
    tags: ['minimalist', 'neutral', 'ui'],
    suggestedApplications: ['Dashboards', 'Docs', 'Product'],
  },
  {
    id: 'maximalist-pop',
    name: 'Maximalist Pop',
    description: 'High-saturation statement brights with playful energy.',
    colors: ['#FF006E', '#8338EC', '#3A86FF', '#FB5607', '#FFBE0B'],
    category: 'design',
    tags: ['maximalist', 'bold', 'y2k'],
    suggestedApplications: ['Campaigns', 'Social', 'Packaging'],
  },
  {
    id: 'retro-70s-warmth',
    name: "Retro '70s Warmth",
    description: 'Sunbaked oranges, olives, and tan for nostalgic sophistication.',
    colors: ['#F4A261', '#E76F51', '#2A9D8F', '#264653', '#E9C46A'],
    category: 'design',
    tags: ['retro', '70s', 'nostalgia'],
    suggestedApplications: ['Editorial', 'Posters', 'Branding'],
  },
  {
    id: 'modern-corporate',
    name: 'Modern Corporate',
    description: 'Trust, clarity, and momentum with blue/green accents.',
    colors: ['#1F2937', '#2563EB', '#10B981', '#F59E0B', '#F3F4F6'],
    category: 'design',
    tags: ['corporate', 'saas', 'ui'],
    suggestedApplications: ['Web', 'Pitch decks', 'Reports'],
  },
];

// Industry-specific
export const INDUSTRY_PALETTES: CuratedPalette[] = [
  {
    id: 'fashion-editorial',
    name: 'Fashion Editorial',
    description: 'Chic neutrals with tempered warm and sage accents.',
    colors: ['#0D0D0D', '#F5F5F5', '#E07A5F', '#3D405B', '#81B29A'],
    category: 'industry',
    tags: ['fashion', 'editorial', 'premium'],
    suggestedApplications: ['Lookbooks', 'Magazines', 'Campaigns'],
  },
  {
    id: 'interior-warm-minimal',
    name: 'Interior Warm Minimal',
    description: 'Tactile creams, mauves, and slate for serene spaces.',
    colors: ['#F2E9E4', '#C9ADA7', '#9A8C98', '#4A4E69', '#22223B'],
    category: 'industry',
    tags: ['interior', 'warm', 'minimal'],
    suggestedApplications: ['Interiors', 'Architecture', 'Moodboards'],
  },
  {
    id: 'web-saas-bright',
    name: 'Web SaaS Bright',
    description: 'Accessible dark base with vivid primary accents.',
    colors: ['#111827', '#1F2937', '#2563EB', '#06B6D4', '#F59E0B'],
    category: 'industry',
    tags: ['web', 'saas', 'accessibility'],
    suggestedApplications: ['Apps', 'Web', 'Design systems'],
  },
  {
    id: 'branding-natural',
    name: 'Branding Natural',
    description: 'Verdant greens and clay red for sustainable brands.',
    colors: ['#2F5233', '#A7C957', '#E9EDC9', '#BC4749', '#6A994E'],
    category: 'industry',
    tags: ['branding', 'eco', 'organic'],
    suggestedApplications: ['Packaging', 'Identity', 'Retail'],
  },
  {
    id: 'print-cmyk-friendly',
    name: 'Print CMYK Friendly',
    description: 'Reliable primaries and deep neutral for clean separations.',
    colors: ['#00AEEF', '#EC008C', '#FFCB05', '#2E3192', '#231F20'],
    category: 'industry',
    tags: ['print', 'cmyk', 'brand'],
    suggestedApplications: ['Print', 'Branding', 'Wayfinding'],
  },
];

// Mood-based
export const MOOD_PALETTES: CuratedPalette[] = [
  {
    id: 'calm-focus',
    name: 'Calm Focus',
    description: 'Soft periwinkle gradients for clarity and trust.',
    colors: ['#EEF2FF', '#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA'],
    category: 'mood',
    tags: ['calm', 'trust', 'clarity'],
    suggestedApplications: ['Wellness', 'Education', 'Productivity'],
  },
  {
    id: 'energetic-spark',
    name: 'Energetic Spark',
    description: 'Punchy heat-map brights with mint relief.',
    colors: ['#FF0844', '#FF6A00', '#FFC400', '#00D084', '#00C6FF'],
    category: 'mood',
    tags: ['energy', 'bold', 'sport'],
    suggestedApplications: ['Sports', 'Events', 'Entertainment'],
  },
  {
    id: 'professional-poise',
    name: 'Professional Poise',
    description: 'Reliable dark neutrals and supportive mid-tones.',
    colors: ['#0F172A', '#1E293B', '#334155', '#64748B', '#94A3B8'],
    category: 'mood',
    tags: ['professional', 'neutral', 'b2b'],
    suggestedApplications: ['B2B', 'Finance', 'Enterprise'],
  },
  {
    id: 'playful-delight',
    name: 'Playful Delight',
    description: 'Confident candy hues with complementary balance.',
    colors: ['#FF80AB', '#FFD166', '#06D6A0', '#118AB2', '#EF476F'],
    category: 'mood',
    tags: ['playful', 'kids', 'fun'],
    suggestedApplications: ['Toys', 'Games', 'Apps'],
  },
  {
    id: 'timeless-elegance',
    name: 'Timeless Elegance',
    description: 'Luxe indigos and plum with a warm metallic accent.',
    colors: ['#2C2C54', '#474787', '#706FD3', '#B33771', '#C7A27C'],
    category: 'mood',
    tags: ['elegant', 'premium', 'luxe'],
    suggestedApplications: ['Hospitality', 'Beauty', 'Fashion'],
  },
];

// Cultural / Regional
export const CULTURAL_PALETTES: CuratedPalette[] = [
  {
    id: 'scandinavian-minimal',
    name: 'Scandinavian Minimal',
    description: 'Pale neutrals with charcoal contrast for quiet confidence.',
    colors: ['#F7F7F7', '#D1D5DB', '#9CA3AF', '#4B5563', '#111827'],
    category: 'cultural',
    tags: ['nordic', 'minimal', 'neutral'],
    suggestedApplications: ['Interiors', 'Web', 'Editorial'],
  },
  {
    id: 'mediterranean-coast',
    name: 'Mediterranean Coast',
    description: 'Sun-washed sand with teal sea and terracotta accents.',
    colors: ['#FCEFE3', '#F9D5A7', '#2A9D8F', '#1D3557', '#E76F51'],
    category: 'cultural',
    tags: ['mediterranean', 'warm', 'sea'],
    suggestedApplications: ['Travel', 'Food', 'Lifestyle'],
  },
  {
    id: 'japanese-minimal',
    name: 'Japanese Minimal',
    description: 'Light washi neutrals with vermillion and indigo accents.',
    colors: ['#F2EDE4', '#D72638', '#3F88C5', '#F5EE9E', '#392F5A'],
    category: 'cultural',
    tags: ['japanese', 'minimal', 'craft'],
    suggestedApplications: ['Packaging', 'Editorial', 'Identity'],
  },
  {
    id: 'tropical-breeze',
    name: 'Tropical Breeze',
    description: 'Punchy paradise brights and deep lagoon blue.',
    colors: ['#06D6A0', '#1B9AAA', '#EF476F', '#FFD166', '#073B4C'],
    category: 'cultural',
    tags: ['tropical', 'vibrant', 'islands'],
    suggestedApplications: ['Events', 'Travel', 'Social'],
  },
  {
    id: 'desert-southwest',
    name: 'Desert Southwest',
    description: 'Adobe clay, saguaro green, and midnight canyon.',
    colors: ['#E9C46A', '#F4A261', '#E76F51', '#2A9D8F', '#264653'],
    category: 'cultural',
    tags: ['desert', 'southwest', 'earthy'],
    suggestedApplications: ['Outdoors', 'Retail', 'Hospitality'],
  },
];

export const ALL_CURATED_PALETTES: CuratedPalette[] = [
  ...SEASONAL_PALETTES,
  ...DESIGN_TREND_PALETTES,
  ...INDUSTRY_PALETTES,
  ...MOOD_PALETTES,
  ...CULTURAL_PALETTES,
];

