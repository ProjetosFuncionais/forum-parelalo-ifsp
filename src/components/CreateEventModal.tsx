import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { IFSP_CAMPUSES, EVENT_CATEGORIES } from '../data/campuses';
import { EventCategory } from '../types';
import { todayYmd } from '../lib/format';
import { Button, Field, Modal, cx, inputClass, textareaClass, toast } from './ui';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('tecnologia');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [campus, setCampus] = useState(IFSP_CAMPUSES[0].name);
  const [location, setLocation] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [onlineLink, setOnlineLink] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setCampus(currentUser?.campus || IFSP_CAMPUSES[0].name);
    setError('');
  }, [isOpen, currentUser?.campus]);

  if (!currentUser) return null;

  const reset = () => {
    setTitle('');
    setDescription('');
    setCategory('tecnologia');
    setDate('');
    setStartTime('');
    setEndTime('');
    setLocation('');
    setIsOnline(false);
    setOnlineLink('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');

    if (!title.trim() || !description.trim() || !date || !startTime) {
      setError('Preencha título, descrição, data e horário de início.');
      return;
    }
    if (date < todayYmd()) {
      setError('A data do evento já passou.');
      return;
    }
    if (endTime && endTime <= startTime) {
      setError('O horário de término precisa ser depois do início.');
      return;
    }
    if (!isOnline && !location.trim()) {
      setError('Informe o local do evento.');
      return;
    }
    if (isOnline && onlineLink.trim() && !/^https?:\/\/\S+$/.test(onlineLink.trim())) {
      setError('O link da transmissão precisa começar com http:// ou https://');
      return;
    }

    storage.createEvent({
      organizerId: currentUser.id,
      title: title.trim(),
      description: description.trim(),
      category,
      date,
      time: endTime ? `${startTime} – ${endTime}` : startTime,
      location: location.trim() || 'Online',
      isOnline,
      onlineLink: isOnline && onlineLink.trim() ? onlineLink.trim() : undefined,
      campus,
      status: 'upcoming'
    });

    reset();
    onClose();
    toast('Evento publicado');
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Divulgar evento"
      size="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={() => handleSubmit()}>Publicar evento</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <p role="alert" className="text-sm text-danger bg-danger-soft rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <Field label="Título">
          {id => (
            <input
              id={id}
              type="text"
              value={title}
              maxLength={120}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex.: Semana de Informática 2026"
              className={inputClass}
            />
          )}
        </Field>

        <Field label="Descrição">
          {id => (
            <textarea
              id={id}
              rows={4}
              value={description}
              maxLength={1500}
              onChange={e => setDescription(e.target.value)}
              placeholder="Programação, palestrantes, pré-requisitos…"
              className={textareaClass}
            />
          )}
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Categoria">
            {id => (
              <select id={id} value={category} onChange={e => setCategory(e.target.value as EventCategory)} className={inputClass}>
                {EVENT_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Campus">
            {id => (
              <select id={id} value={campus} onChange={e => setCampus(e.target.value)} className={inputClass}>
                {IFSP_CAMPUSES.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            )}
          </Field>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Field label="Data" className="col-span-2 sm:col-span-1">
            {id => (
              <input id={id} type="date" min={todayYmd()} value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
            )}
          </Field>
          <Field label="Início">
            {id => <input id={id} type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={inputClass} />}
          </Field>
          <Field label="Término (opcional)">
            {id => <input id={id} type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputClass} />}
          </Field>
        </div>

        <fieldset>
          <legend className="text-[13px] font-medium text-ink-2 mb-1.5">Formato</legend>
          <div className="inline-flex rounded-md border border-line-strong p-0.5 bg-subtle">
            {[
              { value: false, label: 'Presencial' },
              { value: true, label: 'Online' }
            ].map(opt => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setIsOnline(opt.value)}
                aria-pressed={isOnline === opt.value}
                className={cx(
                  'h-8 px-4 rounded text-sm transition-colors',
                  isOnline === opt.value ? 'bg-surface text-ink font-medium shadow-sm' : 'text-muted hover:text-ink'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        {isOnline ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Link da transmissão">
              {id => (
                <input
                  id={id}
                  type="url"
                  value={onlineLink}
                  onChange={e => setOnlineLink(e.target.value)}
                  placeholder="https://meet.google.com/…"
                  className={inputClass}
                />
              )}
            </Field>
            <Field label="Plataforma ou local (opcional)">
              {id => (
                <input
                  id={id}
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Ex.: Google Meet + Auditório 2"
                  className={inputClass}
                />
              )}
            </Field>
          </div>
        ) : (
          <Field label="Local">
            {id => (
              <input
                id={id}
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Ex.: Auditório central, bloco B"
                className={inputClass}
              />
            )}
          </Field>
        )}
      </form>
    </Modal>
  );
};
