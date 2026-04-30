-- Add status column to follows (existing rows default to 'accepted')
ALTER TABLE public.follows
  ADD COLUMN status text NOT NULL DEFAULT 'accepted'
  CHECK (status IN ('accepted', 'pending', 'rejected'));

CREATE INDEX idx_follows_status ON public.follows(follower_id, status);
CREATE INDEX idx_follows_target_pending ON public.follows(following_id, status) WHERE status = 'pending';

-- Update RLS policies on follows
DROP POLICY "Anyone can view follows" ON public.follows;

CREATE POLICY "View follows"
  ON public.follows FOR SELECT USING (
    status = 'accepted'
    OR follower_id = auth.uid()
    OR following_id = auth.uid()
  );

CREATE POLICY "Target user can update follow status"
  ON public.follows FOR UPDATE USING (auth.uid() = following_id);

-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('follow_request', 'follow_accepted', 'new_follower')),
  reference_id text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Notifications can be inserted"
  ON public.notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- Update search RPCs to respect follow status

DROP FUNCTION IF EXISTS public.search_users(text, uuid);
DROP FUNCTION IF EXISTS public.search_posts(text, uuid);

CREATE OR REPLACE FUNCTION public.search_users(query_text text, caller_id uuid)
RETURNS TABLE (
  id uuid,
  username text,
  display_name text,
  bio text,
  avatar_url text,
  is_following boolean,
  follow_status text
) AS $$
DECLARE
  pattern text := lower(query_text) || '%';
BEGIN
  RETURN QUERY
    SELECT
      p.id,
      p.username,
      p.display_name,
      p.bio,
      p.avatar_url,
      EXISTS(
        SELECT 1 FROM public.follows f
        WHERE f.follower_id = caller_id AND f.following_id = p.id AND f.status = 'accepted'
      ) AS is_following,
      (SELECT f.status FROM public.follows f
       WHERE f.follower_id = caller_id AND f.following_id = p.id
       LIMIT 1) AS follow_status
    FROM public.profiles p
    WHERE p.id != caller_id
      AND (
        lower(p.username) LIKE pattern
        OR lower(p.display_name) LIKE pattern
      )
    ORDER BY
      CASE WHEN lower(p.username) = lower(query_text) THEN 0
           WHEN lower(p.username) LIKE pattern THEN 1
           ELSE 2
      END
    LIMIT 20;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.search_posts(query_text text, caller_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  title text,
  week_number int,
  year int,
  word_count int,
  cover_color text,
  tags text[],
  is_late boolean,
  published_at timestamptz,
  username text,
  display_name text,
  avatar_url text,
  rank real
) AS $$
BEGIN
  RETURN QUERY
    SELECT
      po.id,
      po.user_id,
      po.title,
      po.week_number,
      po.year,
      po.word_count,
      po.cover_color,
      po.tags,
      po.is_late,
      po.published_at,
      pr.username,
      pr.display_name,
      pr.avatar_url,
      ts_rank(po.search_vector, websearch_to_tsquery('english', query_text)) AS rank
    FROM public.posts po
    JOIN public.follows fw ON fw.follower_id = caller_id AND fw.following_id = po.user_id AND fw.status = 'accepted'
    JOIN public.profiles pr ON pr.id = po.user_id
    WHERE po.is_published = true
      AND po.search_vector @@ websearch_to_tsquery('english', query_text)
    ORDER BY rank DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
