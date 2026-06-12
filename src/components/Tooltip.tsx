'use client';

import { useRef, useState, useCallback, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  text: string;
  children?: React.ReactNode;
  className?: string;
  iconSize?: number;
  side?: 'top' | 'bottom';
  align?: 'center' | 'start' | 'end';
  sideOffset?: number;
  collisionPadding?: number;
  zIndex?: number;
  ariaLabel?: string;
}

export function Tooltip({
  text,
  children,
  side = 'top',
  align = 'center',
  sideOffset = 6,
  collisionPadding = 8,
  zIndex = 9999,
  iconSize = 12,
  ariaLabel,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({
    top: 0,
    left: 0,
    actualSide: side,
    width: 0,
  });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  const computePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const tooltipWidth = 224; // w-56
    const tooltipHeight = 60; // estimado

    let left = rect.left + rect.width / 2;
    if (align === 'start') left = rect.left;
    if (align === 'end') left = rect.right;

    // Clamp horizontal
    left = Math.max(
      collisionPadding + tooltipWidth / 2,
      Math.min(vw - collisionPadding - tooltipWidth / 2, left)
    );

    let top: number;
    let actualSide: 'top' | 'bottom';

    const spaceTop = rect.top - collisionPadding;
    const spaceBottom = vh - rect.bottom - collisionPadding;

    if (side === 'top' && spaceTop >= tooltipHeight + sideOffset) {
      top = rect.top - sideOffset;
      actualSide = 'top';
    } else if (spaceBottom >= tooltipHeight + sideOffset) {
      top = rect.bottom + sideOffset;
      actualSide = 'bottom';
    } else if (spaceTop >= tooltipHeight + sideOffset) {
      top = rect.top - sideOffset;
      actualSide = 'top';
    } else {
      top = rect.bottom + sideOffset;
      actualSide = 'bottom';
    }

    setPos({
      top,
      left,
      actualSide,
      width: tooltipWidth,
    });
  }, [side, align, sideOffset, collisionPadding]);

  const show = useCallback(() => {
    computePosition();
    setVisible(true);
  }, [computePosition]);

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const handle = () => computePosition();
    window.addEventListener('scroll', handle, true);
    window.addEventListener('resize', handle);
    return () => {
      window.removeEventListener('scroll', handle, true);
      window.removeEventListener('resize', handle);
    };
  }, [visible, computePosition]);

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex items-center cursor-help"
        aria-label={ariaLabel}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
        <HelpCircle size={iconSize} className="text-text-muted ml-1" />
      </span>
      {visible &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            key={tooltipId}
            className="fixed pointer-events-none"
            style={{
              top: pos.top,
              left: pos.left,
              transform: pos.actualSide === 'top'
                ? 'translate(-50%, -100%)'
                : 'translate(-50%, 0)',
              zIndex,
            }}
          >
            <div className="relative w-56 px-3 py-2 bg-bg-card border border-border rounded-lg text-xs text-text-secondary shadow-lg">
              {text}
              <span
                className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${
                  pos.actualSide === 'top'
                    ? 'top-full border-t-bg-card'
                    : 'bottom-full border-b-bg-card'
                }`}
                style={{ marginTop: pos.actualSide === 'top' ? -1 : 0, marginBottom: pos.actualSide === 'bottom' ? -1 : 0 }}
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export function LabelWithTooltip({
  label,
  tooltip,
  iconSize,
  side,
  align,
  sideOffset,
  collisionPadding,
  ariaLabel,
}: {
  label: string;
  tooltip?: string;
  iconSize?: number;
  side?: 'top' | 'bottom';
  align?: 'center' | 'start' | 'end';
  sideOffset?: number;
  collisionPadding?: number;
  ariaLabel?: string;
}) {
  if (!tooltip) return <>{label}</>;
  return (
    <Tooltip
      text={tooltip}
      iconSize={iconSize}
      side={side}
      align={align}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      ariaLabel={ariaLabel}
    >
      {label}
    </Tooltip>
  );
}
