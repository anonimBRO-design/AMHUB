-- Fan-out target for "creator published a new preset" follower notifications.

ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('like', 'comment', 'follow', 'download', 'bookmark', 'approval', 'moderation', 'system', 'new_preset'));

CREATE INDEX IF NOT EXISTS notifications_user_created_idx
	ON public.notifications (user_id, created_at DESC);
