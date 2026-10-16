import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { Button, Modal, cx, textareaClass, toast } from './ui';

interface ReportModalProps {
  targetId: string;
  targetType: 'post' | 'comment' | 'event' | 'user';
  targetTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  'Ofensa, assédio ou discurso de ódio',
  'Informação falsa sobre disciplinas, editais ou o IFSP',
  'Spam, golpe ou propaganda',
  'Plágio ou violação de direitos autorais',
  'Outro motivo'
];

const TARGET_LABEL = {
  post: 'publicação',
  comment: 'comentário',
  event: 'evento',
  user: 'perfil'
};

export const ReportModal: React.FC<ReportModalProps> = ({ targetId, targetType, targetTitle, isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  const close = () => {
    setReason('');
    setDetails('');
    onClose();
  };

  const handleSubmit = () => {
    if (!currentUser || !reason) return;
    storage.createReport({
      reporterId: currentUser.id,
      targetId,
      targetType,
      reason,
      details: details.trim() || undefined
    });
    close();
    toast('Denúncia enviada para a moderação');
  };

  return (
    <Modal
      open={isOpen}
      onClose={close}
      title={`Denunciar ${TARGET_LABEL[targetType]}`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={close}>Cancelar</Button>
          <Button variant="danger" size="sm" onClick={handleSubmit} disabled={!reason || !currentUser}>
            Enviar denúncia
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {targetTitle && (
          <blockquote className="text-sm text-muted border-l-2 border-line-strong pl-3 line-clamp-3">
            {targetTitle}
          </blockquote>
        )}

        <fieldset className="space-y-1">
          <legend className="text-[13px] font-medium text-ink-2 mb-2">Qual é o problema?</legend>
          {REPORT_REASONS.map(r => (
            <label
              key={r}
              className={cx(
                'flex items-center gap-3 px-3 min-h-11 py-2 rounded-md text-sm cursor-pointer transition-colors',
                reason === r ? 'bg-subtle text-ink' : 'text-ink-2 hover:bg-subtle'
              )}
            >
              <input
                type="radio"
                name={`report-${targetId}`}
                checked={reason === r}
                onChange={() => setReason(r)}
                className="accent-[var(--accent)] w-4 h-4"
              />
              {r}
            </label>
          ))}
        </fieldset>

        <label className="block space-y-1.5">
          <span className="block text-[13px] font-medium text-ink-2">Detalhes (opcional)</span>
          <textarea
            value={details}
            onChange={e => setDetails(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Ajude a moderação a entender o contexto"
            className={textareaClass}
          />
        </label>
      </div>
    </Modal>
  );
};
