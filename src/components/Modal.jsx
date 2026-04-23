import React from 'react';
import './Modal.css';

/**
 * 재사용 가능한 Modal 컴포넌트
 * @param {boolean} isOpen - 모달 표시 여부
 * @param {function} onClose - 모달 닫기 함수
 * @param {string} title - 모달 제목
 * @param {string} message - 모달 메시지
 * @param {array} actions - 액션 버튼 배열 [{label, onClick, variant}]
 */
export default function Modal({ isOpen, onClose, title, message, actions, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {title && <h2 className="modal-title">{title}</h2>}
        
        <div className="modal-body">
          {message && <p className="modal-message">{message}</p>}
          {children && <div className="modal-children">{children}</div>}
        </div>

        {actions && (
          <div className="modal-footer">
            {actions.map((action, index) => (
              <button
                key={index}
                className={`btn ${action.variant === 'secondary' ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => {
                  action.onClick?.();
                  if (action.closeAfter !== false) onClose();
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
}
