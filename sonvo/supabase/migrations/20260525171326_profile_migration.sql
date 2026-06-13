CREATE TABLE IF NOT EXISTS public.profiles(
    id uuid REFERENCES auth.users PRIMARY KEY,
    full_name TEXT,
    chinese_level TEXT,
    motivations TEXT[],
    interests TEXT[],
    onboarding_completed BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    premium_expires_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

REVOKE UPDATE ON TABLE public.profiles FROM authenticated;
REVOKE INSERT ON TABLE public.profiles FROM authenticated;

GRANT SELECT ON TABLE public.profiles TO authenticated;

GRANT INSERT(
    id,
    full_name,
    chinese_level,
    motivations,
    interests,
    onboarding_completed,
    updated_at
) ON TABLE public.profiles TO authenticated;


GRANT UPDATE(
    id,
    full_name,
    chinese_level,
    motivations,
    interests,
    onboarding_completed,
    updated_at
) ON TABLE public.profiles TO authenticated;