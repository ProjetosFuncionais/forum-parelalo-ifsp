import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { IFSP_CAMPUSES } from '../data/campuses';
import { UserAvatar } from './UserAvatar';
import { Button, Modal, cx, inputClass, toast } from './ui';
import { ImagePlus, X } from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: (postId: string) => void;
}

const MAX_LENGTH = 1000;
const ALL_CAMPI = 'Todos os Campi (Geral)';
const SUGGESTED_TAGS = ['IniciacaoCientifica', 'TCC', 'Sematec', 'Estagio', 'Duvidas', 'Programacao'];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onPostCreated }) => {
  const { currentUser } = useAuth();
  const [content, setContent] = useState('');
  const [campus, setCampus] = useState(ALL_CAMPI);
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageBroken, setImageBroken] = useState(false);

  // Ao abrir, começa pelo campus de quem está publicando.
  useEffect(() => {
    if (isOpen) setCampus(currentUser?.campus || ALL_CAMPI);
  }, [isOpen, currentUser?.campus]);

  if (!currentUser) return null;

  const reset = () => {
    setContent('');
    setImageUrl('');
    setShowImageInput(false);
    setImageBroken(false);
  };

  const close = () => {
    if (content.trim() && !window.confirm('Descartar o texto que você escreveu?')) return;
    reset();
    onClose();
  };

  const remaining = MAX_LENGTH - content.length;
  const validImage = /^https?:\/\/\S+$/.test(imageUrl.trim()) && !imageBroken;
  const canSubmit = content.trim().length > 0 && remaining >= 0;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;

    const tags = Array.from(new Set((content.match(/#[\p{L}\p{N}_]+/gu) ?? []).map(t => t.slice(1))));
    const post = storage.createPost({
      authorId: currentUser.id,
      content: content.trim(),
      campus,
      tags,
      images: validImage ? [imageUrl.trim()] : undefined
    });

    reset();
    onClose();
    toast('Publicado');
    onPostCreated?.(post.id);
  };

  const addTag = (tag: string) => {
    if (content.includes(`#${tag}`)) return;
    setContent(c => `${c}${c && !/\s$/.test(c) ? ' ' : ''}#${tag} `);
  };

  return (
    <Modal
      open={isOpen}
      onClose={close}
      title="Nova publicação"
      footer={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowImageInput(s => !s)}
            className="mr-auto"
            aria-pressed={showImageInput}
          >
            <ImagePlus className="w-4 h-4" />
            Imagem
          </Button>
          <span className={cx('font-mono text-xs mr-2', remaining < 50 ? 'text-warn' : 'text-muted', remaining < 0 && 'text-danger')}>
            {remaining}
          </span>
          <Button variant="primary" size="sm" onClick={() => handleSubmit()} disabled={!canSubmit}>
            Publicar
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3">
          <UserAvatar user={currentUser} size="md" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink truncate">{currentUser.name}</p>
            <label className="flex items-center gap-1 text-[13px] text-muted">
              <span>Para</span>
              <select
                value={campus}
                onChange={e => setCampus(e.target.value)}
                className="bg-transparent text-ink font-medium focus:outline-none cursor-pointer -ml-0.5 max-w-[14rem] truncate"
              >
                <option value={ALL_CAMPI}>todos os campi</option>
                {IFSP_CAMPUSES.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <textarea
          autoFocus
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Compartilhe uma dúvida, um projeto ou um aviso. Use #hashtags para organizar."
          rows={6}
          aria-label="Texto da publicação"
          className="w-full bg-transparent text-[15px] leading-relaxed text-ink placeholder:text-muted focus:outline-none resize-none"
        />

        {showImageInput && (
          <div className="space-y-2">
            <div className="relative">
              <input
                type="url"
                value={imageUrl}
                onChange={e => {
                  setImageUrl(e.target.value);
                  setImageBroken(false);
                }}
                placeholder="Cole o link de uma imagem (https://…)"
                aria-label="Link da imagem"
                className={cx(inputClass, 'pr-10')}
              />
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  aria-label="Remover imagem"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {imageUrl.trim() && (
              imageBroken ? (
                <p className="text-xs text-danger">Não foi possível carregar essa imagem.</p>
              ) : (
                <img
                  src={imageUrl.trim()}
                  alt="Pré-visualização"
                  referrerPolicy="no-referrer"
                  onError={() => setImageBroken(true)}
                  className="w-full max-h-48 object-cover rounded-md border border-line"
                />
              )
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 pt-1">
          {SUGGESTED_TAGS.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className="h-7 px-2.5 rounded-md border border-line text-[13px] text-muted hover:text-ink hover:border-line-strong"
            >
              #{tag}
            </button>
          ))}
        </div>
      </form>
    </Modal>
  );
};
