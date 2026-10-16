import React, { useMemo, useState } from 'react';
import { Comment, Post } from '../types';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { Navigate, absoluteUrl, routeHref } from '../lib/router';
import { fullDateTime, timeAgo } from '../lib/format';
import { RoleTag, UserAvatar } from './UserAvatar';
import { ReportModal } from './ReportModal';
import { RichText } from './RichText';
import { Button, IconButton, Menu, MenuItem, cx, textareaClass, toast } from './ui';
import {
  Heart, MessageCircle, Bookmark, Link2, MoreHorizontal,
  Trash2, Pencil, Flag, Send, Pin, X
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  onNavigate: Navigate;
  onSelectTag?: (tag: string) => void;
  /** Abre os comentários já expandidos (página do post). */
  defaultShowComments?: boolean;
  className?: string;
}

/** Ordena comentários com as respostas logo abaixo do comentário original. */
function threadComments(comments: Comment[]): Comment[] {
  const byDate = (a: Comment, b: Comment) => a.createdAt.localeCompare(b.createdAt);
  const roots = comments.filter(c => !c.parentId).sort(byDate);
  const ordered: Comment[] = [];
  for (const root of roots) {
    ordered.push(root);
    ordered.push(...comments.filter(c => c.parentId === root.id).sort(byDate));
  }
  // Respostas cujo comentário original sumiu.
  const orphans = comments.filter(c => !ordered.includes(c)).sort(byDate);
  return [...ordered, ...orphans];
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onNavigate,
  onSelectTag,
  defaultShowComments = false,
  className
}) => {
  const { currentUser, dataVersion } = useAuth();

  const [showReport, setShowReport] = useState(false);
  const [showComments, setShowComments] = useState(defaultShowComments);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [commentInput, setCommentInput] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  const author = storage.getUserById(post.authorId);
  const isLiked = currentUser ? storage.hasUserLiked(currentUser.id, post.id, 'post') : false;
  const isSaved = currentUser ? storage.isPostSaved(currentUser.id, post.id) : false;
  // dataVersion garante que os comentários sejam relidos após qualquer gravação.
  const comments = useMemo(
    () => threadComments(storage.getCommentsByPost(post.id)),
    [post.id, dataVersion]
  );

  const isAuthor = currentUser?.id === post.authorId;
  const canModerate = isAuthor || currentUser?.role === 'admin' || currentUser?.role === 'moderator';

  const requireAuth = () => {
    if (!currentUser) {
      onNavigate('auth');
      return false;
    }
    return true;
  };

  const handleLike = () => {
    if (requireAuth()) storage.toggleLike(currentUser!.id, post.id, 'post');
  };

  const handleSave = () => {
    if (!requireAuth()) return;
    const saved = storage.toggleSavePost(currentUser!.id, post.id);
    toast(saved ? 'Salvo nos seus itens' : 'Removido dos salvos');
  };

  const handleShare = async () => {
    const url = absoluteUrl('post', post.id);
    try {
      if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
        await navigator.share({ title: `Publicação de ${author?.name ?? 'IFSP'}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast('Link copiado');
      }
      storage.sharePost(post.id);
    } catch {
      /* compartilhamento cancelado */
    }
  };

  const handleDelete = () => {
    if (!currentUser) return;
    if (window.confirm('Excluir esta publicação? Os comentários também serão apagados.')) {
      storage.deletePost(post.id, currentUser.id);
      toast('Publicação excluída');
    }
  };

  const handleSaveEdit = () => {
    const content = editContent.trim();
    if (!content) return;
    const tags = Array.from(new Set([
      ...post.tags,
      ...(content.match(/#[\p{L}\p{N}_]+/gu) ?? []).map(t => t.slice(1))
    ]));
    storage.updatePost(post.id, { content, tags });
    setIsEditing(false);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth() || !commentInput.trim()) return;
    storage.createComment({
      postId: post.id,
      authorId: currentUser!.id,
      content: commentInput.trim(),
      parentId: replyTo ? replyTo.parentId || replyTo.id : undefined
    });
    setCommentInput('');
    setReplyTo(null);
  };

  const handleDeleteComment = (commentId: string) => {
    if (!currentUser) return;
    if (window.confirm('Excluir este comentário?')) storage.deleteComment(commentId, currentUser.id);
  };

  // Hashtags que já aparecem no texto não precisam ser repetidas abaixo.
  const extraTags = post.tags.filter(t => !post.content.toLowerCase().includes(`#${t.toLowerCase()}`));
  const selectTag = (tag: string) => (onSelectTag ? onSelectTag(tag) : onNavigate('explore', `#${tag}`));

  return (
    <article className={cx('px-4 sm:px-5 pt-4 pb-2', className)}>
      {post.isPinned && (
        <p className="flex items-center gap-1.5 text-xs text-muted mb-2 pl-[52px]">
          <Pin className="w-3.5 h-3.5" /> Fixado
        </p>
      )}

      <div className="flex gap-3">
        <a
          href={routeHref('profile', post.authorId)}
          onClick={e => { e.preventDefault(); onNavigate('profile', post.authorId); }}
          className="shrink-0 h-fit rounded-full"
          aria-label={`Perfil de ${author?.name ?? 'autor'}`}
        >
          <UserAvatar user={author} size="md" />
        </a>

        <div className="min-w-0 flex-1">
          {/* Cabeçalho */}
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1 leading-tight">
              <div className="flex items-center gap-1.5 min-w-0">
                <a
                  href={routeHref('profile', post.authorId)}
                  onClick={e => { e.preventDefault(); onNavigate('profile', post.authorId); }}
                  className="font-semibold text-[15px] text-ink hover:underline truncate"
                >
                  {author?.name || 'Conta removida'}
                </a>
                <RoleTag role={author?.role} />
              </div>
              <p className="text-[13px] text-muted mt-0.5 truncate">
                {post.campus === 'Todos os Campi (Geral)' ? 'Todos os campi' : post.campus}
                <span aria-hidden="true"> · </span>
                <a
                  href={routeHref('post', post.id)}
                  onClick={e => { e.preventDefault(); onNavigate('post', post.id); }}
                  className="hover:underline"
                  title={fullDateTime(post.createdAt)}
                >
                  <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
                </a>
                {post.updatedAt && <span> · editado</span>}
              </p>
            </div>

            <Menu
              trigger={({ toggle, open }) => (
                <IconButton label="Mais opções" onClick={toggle} aria-expanded={open} className="-mr-2 -mt-1 w-8 h-8">
                  <MoreHorizontal className="w-[18px] h-[18px]" />
                </IconButton>
              )}
            >
              {close => (
                <>
                  <MenuItem onClick={() => { handleShare(); close(); }}>
                    <Link2 className="w-4 h-4" /> Copiar link
                  </MenuItem>
                  {isAuthor && (
                    <MenuItem onClick={() => { setEditContent(post.content); setIsEditing(true); close(); }}>
                      <Pencil className="w-4 h-4" /> Editar
                    </MenuItem>
                  )}
                  {canModerate && (
                    <MenuItem danger onClick={() => { close(); handleDelete(); }}>
                      <Trash2 className="w-4 h-4" /> Excluir
                    </MenuItem>
                  )}
                  {!isAuthor && (
                    <MenuItem onClick={() => { close(); if (requireAuth()) setShowReport(true); }}>
                      <Flag className="w-4 h-4" /> Denunciar
                    </MenuItem>
                  )}
                </>
              )}
            </Menu>
          </div>

          {/* Conteúdo */}
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                rows={5}
                maxLength={1000}
                autoFocus
                className={textareaClass}
                aria-label="Editar publicação"
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                <Button size="sm" variant="primary" onClick={handleSaveEdit} disabled={!editContent.trim()}>
                  Salvar
                </Button>
              </div>
            </div>
          ) : (
            <RichText
              text={post.content}
              onTag={selectTag}
              className="mt-2 text-[15px] leading-relaxed text-ink whitespace-pre-line break-words"
            />
          )}

          {post.images?.[0] && !imageFailed && (
            <div className="mt-3 rounded-md overflow-hidden border border-line bg-subtle">
              <img
                src={post.images[0]}
                alt="Imagem anexada à publicação"
                referrerPolicy="no-referrer"
                loading="lazy"
                onError={() => setImageFailed(true)}
                className="w-full max-h-[28rem] object-cover"
              />
            </div>
          )}

          {extraTags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
              {extraTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => selectTag(tag)}
                  className="text-[13px] text-accent-ink hover:underline underline-offset-2"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Ações */}
          <div className="mt-2 -ml-2 flex items-center text-[13px] text-muted">
            <ActionButton
              onClick={handleLike}
              active={isLiked}
              activeClass="text-like"
              label={isLiked ? 'Descurtir' : 'Curtir'}
            >
              <Heart className={cx('w-[18px] h-[18px]', isLiked && 'fill-current')} />
              <span className="font-mono">{post.likesCount || 0}</span>
            </ActionButton>

            <ActionButton
              onClick={() => setShowComments(s => !s)}
              active={showComments}
              activeClass="text-ink"
              label="Comentários"
            >
              <MessageCircle className="w-[18px] h-[18px]" />
              <span className="font-mono">{comments.length}</span>
            </ActionButton>

            <ActionButton onClick={handleShare} label="Compartilhar">
              <Link2 className="w-[18px] h-[18px]" />
              <span className="font-mono">{post.sharesCount || 0}</span>
            </ActionButton>

            <ActionButton
              onClick={handleSave}
              active={isSaved}
              activeClass="text-accent-ink"
              label={isSaved ? 'Remover dos salvos' : 'Salvar'}
              className="ml-auto"
            >
              <Bookmark className={cx('w-[18px] h-[18px]', isSaved && 'fill-current')} />
            </ActionButton>
          </div>

          {/* Comentários */}
          {showComments && (
            <div className="mt-1 mb-2 pt-3 border-t border-line">
              {comments.length > 0 && (
                <ul className="space-y-3 mb-3">
                  {comments.map(c => {
                    const cAuthor = storage.getUserById(c.authorId);
                    const canDelete =
                      currentUser?.id === c.authorId ||
                      currentUser?.role === 'admin' ||
                      currentUser?.role === 'moderator';
                    return (
                      <li key={c.id} className={cx('flex gap-2.5', c.parentId && 'ml-8')}>
                        <button onClick={() => onNavigate('profile', c.authorId)} className="shrink-0 h-fit rounded-full">
                          <UserAvatar user={cAuthor} size={c.parentId ? 'xs' : 'sm'} />
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="rounded-md bg-subtle px-3 py-2">
                            <p className="text-[13px] leading-tight">
                              <button
                                onClick={() => onNavigate('profile', c.authorId)}
                                className="font-semibold text-ink hover:underline"
                              >
                                {cAuthor?.name ?? 'Conta removida'}
                              </button>
                              <span className="text-muted"> · {timeAgo(c.createdAt)}</span>
                            </p>
                            <p className="text-sm text-ink-2 mt-1 leading-relaxed whitespace-pre-line break-words">
                              {c.content}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 mt-1 ml-3 text-xs text-muted">
                            <button onClick={() => { if (requireAuth()) setReplyTo(c); }} className="hover:text-ink">
                              Responder
                            </button>
                            {canDelete && (
                              <button onClick={() => handleDeleteComment(c.id)} className="hover:text-danger">
                                Excluir
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              {currentUser ? (
                <form onSubmit={handleAddComment} className="flex gap-2.5 items-start">
                  <UserAvatar user={currentUser} size="sm" className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    {replyTo && (
                      <p className="flex items-center gap-1 text-xs text-muted mb-1">
                        Respondendo a {storage.getUserById(replyTo.authorId)?.name.split(' ')[0]}
                        <button type="button" onClick={() => setReplyTo(null)} aria-label="Cancelar resposta" className="p-0.5 hover:text-ink">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 rounded-md border border-line-strong bg-surface focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 pr-1">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={e => setCommentInput(e.target.value)}
                        placeholder={replyTo ? 'Escreva sua resposta' : 'Escreva um comentário'}
                        maxLength={500}
                        aria-label="Comentário"
                        className="flex-1 min-w-0 h-9 px-3 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
                      />
                      <IconButton
                        type="submit"
                        label="Enviar comentário"
                        disabled={!commentInput.trim()}
                        className="w-8 h-8 text-accent disabled:text-muted disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                      </IconButton>
                    </div>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-muted">
                  <button onClick={() => onNavigate('auth')} className="text-accent-ink font-medium hover:underline">
                    Entre
                  </button>{' '}
                  para comentar.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <ReportModal
        targetId={post.id}
        targetType="post"
        targetTitle={post.content.slice(0, 120)}
        isOpen={showReport}
        onClose={() => setShowReport(false)}
      />
    </article>
  );
};

const ActionButton: React.FC<{
  onClick: () => void;
  active?: boolean;
  activeClass?: string;
  label: string;
  className?: string;
  children: React.ReactNode;
}> = ({ onClick, active, activeClass, label, className, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    aria-pressed={active}
    title={label}
    className={cx(
      'inline-flex items-center gap-1.5 h-9 px-2 mr-3 rounded-md transition-colors hover:bg-subtle hover:text-ink',
      active && activeClass,
      className
    )}
  >
    {children}
  </button>
);
