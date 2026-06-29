/**
 * PresetHub Design Tokens — TypeScript Definitions
 * Generated from Design System §2-§16
 */

export type SpacingToken =
  | 'px'
  | '0.5'
  | '1'
  | '1.5'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '8'
  | '10'
  | '12'
  | '16'
  | '20'
  | '24';

export type RadiusToken =
  | 'none'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | 'full';

export type ShadowToken =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | 'card'
  | 'card-hover'
  | 'modal'
  | 'dropdown'
  | 'glow-xs'
  | 'glow-sm'
  | 'glow-md'
  | 'glow-lg'
  | 'focus'
  | 'focus-error'
  | 'none';

export type ZIndexToken =
  | 'base'
  | 'raised'
  | 'dropdown'
  | 'sticky'
  | 'overlay'
  | 'modal'
  | 'notification'
  | 'tooltip'
  | 'max';

export type DurationToken =
  | 'instant'
  | 'fast'
  | 'normal'
  | 'slow'
  | 'xslow'
  | 'glacial'
  | 'loop';

export type EasingToken =
  | 'linear'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'spring'
  | 'spring-sm'
  | 'bounce'
  | 'snap';

export type FontFamilyToken =
  | 'display'
  | 'body'
  | 'mono'
  | 'sans';

export type FontSizeToken =
  | 'display-2xl'
  | 'display-xl'
  | 'display-lg'
  | 'display-md'
  | 'display-sm'
  | 'heading-xl'
  | 'heading-lg'
  | 'heading-md'
  | 'heading-sm'
  | 'body-lg'
  | 'body-md'
  | 'body-sm'
  | 'body-xs'
  | 'label-lg'
  | 'label-md'
  | 'label-sm'
  | 'label-xs'
  | 'mono-md'
  | 'mono-sm'
  | 'mono-code';

export type FontWeightToken =
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold';

export type ColorCategory =
  | 'bg'
  | 'text'
  | 'border'
  | 'interactive'
  | 'category'
  | 'rarity'
  | 'accent';

export type BackgroundColorToken =
  | 'base'
  | 'surface'
  | 'elevated'
  | 'input'
  | 'overlay'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export type TextColorToken =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'disabled'
  | 'inverse'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export type BorderColorToken =
  | 'subtle'
  | 'default'
  | 'strong'
  | 'accent'
  | 'error'
  | 'success';

export type InteractiveColorToken =
  | 'primary'
  | 'primary-hover'
  | 'primary-active'
  | 'secondary'
  | 'secondary-hover'
  | 'danger'
  | 'danger-hover';

export type CategoryColorToken =
  | 'velocity'
  | 'transition'
  | 'color'
  | 'anime'
  | 'gaming'
  | 'lyric'
  | '3d'
  | 'other';

export type RarityColorToken =
  | 'common'
  | 'rare'
  | 'epic'
  | 'legendary-start'
  | 'legendary-end';

export interface DesignTokens {
  spacing: Record<SpacingToken, string>;
  radius: Record<RadiusToken, string>;
  shadow: Record<ShadowToken, string>;
  zIndex: Record<ZIndexToken, string>;
  duration: Record<DurationToken, string>;
  easing: Record<EasingToken, string>;
  fontFamily: Record<FontFamilyToken, string>;
  fontSize: Record<FontSizeToken, string>;
  fontWeight: Record<FontWeightToken, number>;
}

export const tokens: DesignTokens = {
  spacing: {
    'px': '1px',
    '0.5': '2px',
    '1': '4px',
    '1.5': '6px',
    '2': '8px',
    '3': '12px',
    '4': '16px',
    '5': '20px',
    '6': '24px',
    '8': '32px',
    '10': '40px',
    '12': '48px',
    '16': '64px',
    '20': '80px',
    '24': '96px',
  },
  radius: {
    'none': '0px',
    'xs': '2px',
    'sm': '4px',
    'md': '8px',
    'lg': '12px',
    'xl': '16px',
    '2xl': '24px',
    'full': '9999px',
  },
  shadow: {
    'xs': '0 1px 2px rgba(0, 0, 0, 0.3)',
    'sm': '0 2px 8px rgba(0, 0, 0, 0.35)',
    'md': '0 4px 16px rgba(0, 0, 0, 0.4)',
    'lg': '0 8px 32px rgba(0, 0, 0, 0.5)',
    'xl': '0 16px 64px rgba(0, 0, 0, 0.6)',
    'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
    'card-hover': '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(124, 58, 237, 0.2)',
    'modal': '0 24px 64px rgba(0, 0, 0, 0.7), 0 0 48px rgba(0, 0, 0, 0.3)',
    'dropdown': '0 8px 24px rgba(0, 0, 0, 0.5)',
    'glow-xs': '0 0 8px rgba(124, 58, 237, 0.15)',
    'glow-sm': '0 0 16px rgba(124, 58, 237, 0.2)',
    'glow-md': '0 0 32px rgba(124, 58, 237, 0.3)',
    'glow-lg': '0 0 56px rgba(124, 58, 237, 0.4)',
    'focus': '0 0 0 3px rgba(124, 58, 237, 0.5)',
    'focus-error': '0 0 0 3px rgba(239, 68, 68, 0.4)',
    'none': 'none',
  },
  zIndex: {
    'base': '0',
    'raised': '10',
    'dropdown': '100',
    'sticky': '200',
    'overlay': '300',
    'modal': '400',
    'notification': '500',
    'tooltip': '600',
    'max': '9999',
  },
  duration: {
    'instant': '50ms',
    'fast': '150ms',
    'normal': '250ms',
    'slow': '400ms',
    'xslow': '600ms',
    'glacial': '1000ms',
    'loop': '2000ms',
  },
  easing: {
    'linear': 'linear',
    'ease-in': 'cubic-bezier(0.4, 0.0, 1.0, 1.0)',
    'ease-out': 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
    'ease-in-out': 'cubic-bezier(0.4, 0.0, 0.2, 1.0)',
    'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1.0)',
    'spring-sm': 'cubic-bezier(0.34, 1.3, 0.64, 1.0)',
    'bounce': 'cubic-bezier(0.34, 1.8, 0.64, 1.0)',
    'snap': 'cubic-bezier(0.2, 0.0, 0.0, 1.0)',
  },
  fontFamily: {
    'display': "'Space Grotesk', system-ui, sans-serif",
    'body': "'Inter', system-ui, sans-serif",
    'mono': "'JetBrains Mono', Menlo, monospace",
    'sans': "'Inter', system-ui, sans-serif",
  },
  fontSize: {
    'display-2xl': '72px',
    'display-xl': '56px',
    'display-lg': '40px',
    'display-md': '32px',
    'display-sm': '24px',
    'heading-xl': '20px',
    'heading-lg': '18px',
    'heading-md': '16px',
    'heading-sm': '14px',
    'body-lg': '18px',
    'body-md': '16px',
    'body-sm': '14px',
    'body-xs': '12px',
    'label-lg': '16px',
    'label-md': '14px',
    'label-sm': '12px',
    'label-xs': '11px',
    'mono-md': '14px',
    'mono-sm': '12px',
    'mono-code': '13px',
  },
  fontWeight: {
    'normal': 400,
    'medium': 500,
    'semibold': 600,
    'bold': 700,
  },
};

export default tokens;
