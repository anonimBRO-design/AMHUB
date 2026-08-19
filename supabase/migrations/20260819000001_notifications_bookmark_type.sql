-- Migration: Add bookmark, approval, moderation to notifications_type_check constraint
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('like', 'comment', 'follow', 'download', 'bookmark', 'approval', 'moderation', 'system'));

-- Allow authenticated users to insert notifications where actor_id = auth.uid()
DROP POLICY IF EXISTS notifications_staff_insert ON public.notifications;

CREATE POLICY notifications_authenticated_insert ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = actor_id OR public.is_staff()
  );
