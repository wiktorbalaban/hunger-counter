export interface Theme {
  primary:      string;
  primaryDark:  string;

  lowHunger:    string;
  mediumHunger: string;
  highHunger:   string;

  conc:         string;
  concLight:    string;

  background:     string;
  surface:        string;
  buttonSurface:  string;
  modalOverlay: string;

  border:        string;
  borderStrong:  string;
  divider:       string;
  chartGrid:     string;
  chartBarWidth: number;
  goalLine:      string;
  goalBand:      string;

  textPrimary:    string;
  textSecondary:  string;
  textMuted:      string;
  textLabel:      string;
  textInactive:   string;
  onPrimary:      string;
  onHunger:       string;
  white:          string;
  secondarySurface: string;

  companionHeaderBg:   string;
  companionHeaderText: string;
}

export const lightTheme: Theme = {
  primary:      '#508c76',
  primaryDark:  '#467b68',

  lowHunger:    '#d4b84a',
  mediumHunger: '#d48850',
  highHunger:   '#c45050',

  conc:         'rgb(52, 52, 177)',
  concLight:    '#5c5c6b',

  background:    '#f9fafb',
  surface:       '#ffffff',
  buttonSurface: '#508c76',
  modalOverlay: 'rgba(0,0,0,0.4)',

  border:        '#e5e7eb',
  borderStrong:  '#d1d5db',
  divider:       '#f3f4f6',
  chartGrid:     '#f3f4f6',
  chartBarWidth: 32,
  goalLine:      '#2f6f58',
  goalBand:      'rgba(80,140,118,0.12)',

  textPrimary:    '#111827',
  textSecondary:  '#4b5563',
  textMuted:      '#9ca3af',
  textLabel:      '#6b7280',
  textInactive:   '#666666',
  onPrimary:      '#ffffff',
  onHunger:       '#ffffff',
  white:          '#ffffff',
  secondarySurface: '#f3f4f6',

  companionHeaderBg:   '#d1d5db',
  companionHeaderText: '#374151',
};

export const darkTheme: Theme = {
  primary:      '#6aad96',
  primaryDark:  '#508c76',

  lowHunger:    '#e0c45a',
  mediumHunger: '#e09660',
  highHunger:   '#d46060',

  conc:         '#5a5a70',
  concLight:    '#9090a8',

  background:    '#111827',
  surface:       '#1f2937',
  buttonSurface: '#374151',
  modalOverlay: 'rgba(0,0,0,0.6)',

  border:        '#374151',
  borderStrong:  '#4b5563',
  divider:       '#374151',
  chartGrid:     '#1f2937',
  chartBarWidth: 12,
  goalLine:      '#8fd0b8',
  goalBand:      'rgba(106,173,150,0.16)',

  textPrimary:    '#f3f4f6',
  textSecondary:  '#d1d5db',
  textMuted:      '#6b7280',
  textLabel:      '#9ca3af',
  textInactive:   '#9ca3af',
  onPrimary:      '#111827',
  onHunger:       '#111827',
  white:          '#ffffff',
  secondarySurface: '#374151',

  companionHeaderBg:   '#1f2937',
  companionHeaderText: '#9ca3af',
};
