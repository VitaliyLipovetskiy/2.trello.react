import React, { JSX, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CardAddPanel } from './CardAddPanel';
import { CardMembersPanel } from '../members/CardMembersPanel';
import s from './card-actions-bar.module.scss';

type ActivePanel = 'add' | 'members' | 'members-from-add' | null;

const calcLeft = (rect: DOMRect, panelWidth = 320): number => {
  if (window.innerWidth < 600) return Math.max(8, window.innerWidth / 2 - panelWidth / 2);
  return Math.max(8, Math.min(rect.left, window.innerWidth - panelWidth - 8));
};

export const CardActionsBar = (): JSX.Element => {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });

  const addBtnRef = useRef<HTMLButtonElement>(null);
  const membersBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const open = (panel: ActivePanel, btnRef: React.RefObject<HTMLButtonElement | null>): void => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPanelPos({ top: rect.bottom + 4, left: calcLeft(rect) });
    }
    setActivePanel(panel);
  };

  useEffect(() => {
    if (!activePanel) return () => {};
    const activeBtnRef = activePanel === 'members' ? membersBtnRef : addBtnRef;
    const handleClickOutside = (e: MouseEvent): void => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        activeBtnRef.current &&
        !activeBtnRef.current.contains(e.target as Node)
      ) {
        setActivePanel(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activePanel]);

  const close = (): void => setActivePanel(null);

  return (
    <div className={s.bar}>
      <button ref={addBtnRef} className={s.btn} onClick={(): void => open('add', addBtnRef)}>
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Додати
      </button>
      <button ref={membersBtnRef} className={s.btn} onClick={(): void => open('members', membersBtnRef)}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
        Учасники
      </button>
      {activePanel === 'add' &&
        createPortal(
          <CardAddPanel
            ref={panelRef}
            style={{ top: panelPos.top, left: panelPos.left }}
            onClose={close}
            onOpenMembers={(): void => setActivePanel('members-from-add')}
          />,
          document.body
        )}
      {(activePanel === 'members' || activePanel === 'members-from-add') &&
        createPortal(
          <CardMembersPanel
            ref={panelRef}
            style={{ top: panelPos.top, left: panelPos.left }}
            onClose={close}
            onBack={activePanel === 'members-from-add' ? (): void => setActivePanel('add') : undefined}
          />,
          document.body
        )}
    </div>
  );
};
