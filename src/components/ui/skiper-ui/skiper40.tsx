import React from 'react';
import './skiper40.css';

export interface SkiperLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  href: string;
  className?: string;
}

type SkiperVariant = '000' | '001' | '002' | '003' | '004' | '005';

function SkiperArrowIcon({ variant }: { variant: SkiperVariant }) {
  const arrowModifier =
    variant === '004'
      ? 'skiper40-arrow-height'
      : variant === '005'
      ? 'skiper40-arrow-width'
      : 'skiper40-arrow-underline';

  return (
    <svg
      className={`skiper40-arrow ${arrowModifier}`}
      fill="none"
      viewBox="0 0 10 10"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function createSkiperLink(variant: SkiperVariant, defaultTarget?: '_blank') {
  const SkiperLinkVariant: React.FC<SkiperLinkProps> = ({
    children,
    href,
    className = '',
    target = defaultTarget,
    rel,
    ...rest
  }) => {
    const resolvedRel = target === '_blank' ? rel || 'noopener noreferrer' : rel;
    const classes = ['skiper40-link', `skiper40-link${variant}`, className].filter(Boolean).join(' ');

    return (
      <a href={href} target={target} rel={resolvedRel} className={classes} {...rest}>
        {children}
        {variant !== '000' && <SkiperArrowIcon variant={variant} />}
      </a>
    );
  };
  return SkiperLinkVariant;
}

/** Bottom underline left-to-right hover sweep link. */
export const Link000 = createSkiperLink('000');

/** Offset underline left-to-right hover sweep link with external indicator arrow. */
export const Link001 = createSkiperLink('001', '_blank');

/** Offset underline right-to-left hover sweep link with reveal arrow. */
export const Link002 = createSkiperLink('002');

/** Center-origin expanding underline hover link with reveal arrow. */
export const Link003 = createSkiperLink('003');

/** Height-reveal difference-blend hover link. */
export const Link004 = createSkiperLink('004');

/** Width-sweep difference-blend hover link. */
export const Link005 = createSkiperLink('005');

/** Demo container showcasing all Skiper 40 animated CSS link variants. */
export const Skiper40: React.FC = () => {
  return (
    <section className="skiper40-section">
      <div className="skiper40-demo-list">
        <Link001 href="mailto:hi@skiper-ui.com">hi@skiper-ui.com</Link001>
        <Link002 href="mailto:hi@skiper-ui.com">hi@skiper-ui.com</Link002>
        <Link003 href="mailto:hi@skiper-ui.com">hi@skiper-ui.com</Link003>
        <Link004 href="mailto:hi@skiper-ui.com">hi@skiper-ui.com</Link004>
        <Link005 href="mailto:hi@skiper-ui.com">hi@skiper-ui.com</Link005>
      </div>
    </section>
  );
};

/**
 * Skiper 40 Animated Link — React (adapted from @skiper-ui/skiper40 CssLink)
 * Inspired by and adapted from https://cursor.com/?from=home
 *
 * License & Usage:
 * - Free to use and modify in both personal and commercial projects.
 * - Attribution to Skiper UI is required when using the free version.
 *
 * Author: @gurvinder-singh02
 * Website: https://gxuri.me
 * Twitter: https://x.com/Gur__vi
 */
