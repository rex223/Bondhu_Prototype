-- Migration: Add personality_type column and update RPC function
-- Date: 2026-01-09
-- Purpose: Store computed personality type from BFI-2-XS assessment

-- Step 1: Add personality_type column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS personality_type TEXT;

COMMENT ON COLUMN public.profiles.personality_type IS 'Computed personality type based on Big Five scores (e.g., Creative Explorer, Goal Achiever)';

-- Step 2: Drop and recreate the update_personality_assessment function with new parameter
DROP FUNCTION IF EXISTS public.update_personality_assessment(
  UUID, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, JSONB, JSONB
);

CREATE OR REPLACE FUNCTION public.update_personality_assessment(
  user_id UUID,
  p_openness INTEGER,
  p_conscientiousness INTEGER,
  p_extraversion INTEGER,
  p_agreeableness INTEGER,
  p_neuroticism INTEGER,
  p_llm_context JSONB,
  p_raw_responses JSONB,
  p_personality_type TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET 
    personality_openness = p_openness,
    personality_conscientiousness = p_conscientiousness,
    personality_extraversion = p_extraversion,
    personality_agreeableness = p_agreeableness,
    personality_neuroticism = p_neuroticism,
    personality_llm_context = p_llm_context,
    personality_raw_responses = p_raw_responses,
    personality_type = COALESCE(p_personality_type, personality_type),
    personality_completed_at = NOW(),
    updated_at = NOW()
  WHERE id = user_id
    AND auth.uid() = user_id;
  
  RETURN FOUND;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.update_personality_assessment(
  UUID, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, JSONB, JSONB, TEXT
) TO authenticated;

GRANT EXECUTE ON FUNCTION public.update_personality_assessment(
  UUID, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, JSONB, JSONB, TEXT
) TO anon;

GRANT EXECUTE ON FUNCTION public.update_personality_assessment(
  UUID, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, JSONB, JSONB, TEXT
) TO service_role;

-- Step 3: Create a helper function to recalculate personality type for existing users
CREATE OR REPLACE FUNCTION public.calculate_personality_type(
  p_openness INTEGER,
  p_conscientiousness INTEGER,
  p_extraversion INTEGER,
  p_agreeableness INTEGER,
  p_neuroticism INTEGER
) RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  result TEXT;
BEGIN
  -- Combination types first
  IF p_openness > 65 AND p_extraversion > 65 THEN
    RETURN 'Visionary Leader';
  END IF;
  
  IF p_conscientiousness > 65 AND p_neuroticism < 35 THEN
    RETURN 'Steadfast Anchor';
  END IF;
  
  IF p_agreeableness > 65 AND p_extraversion > 65 THEN
    RETURN 'Empathic Connector';
  END IF;
  
  IF p_openness > 65 AND p_conscientiousness > 65 THEN
    RETURN 'Thoughtful Analyst';
  END IF;
  
  -- Single dominant traits (> 70)
  IF p_openness > 70 THEN RETURN 'Creative Explorer'; END IF;
  IF p_extraversion > 70 THEN RETURN 'Social Butterfly'; END IF;
  IF p_agreeableness > 70 THEN RETURN 'Compassionate Helper'; END IF;
  IF p_conscientiousness > 70 THEN RETURN 'Goal Achiever'; END IF;
  IF p_neuroticism > 70 THEN RETURN 'Sensitive Soul'; END IF;
  
  -- Default
  RETURN 'Balanced Individual';
END;
$$;

-- Step 4: Backfill personality_type for existing users who completed assessment
UPDATE profiles
SET personality_type = public.calculate_personality_type(
  COALESCE(personality_openness, 50),
  COALESCE(personality_conscientiousness, 50),
  COALESCE(personality_extraversion, 50),
  COALESCE(personality_agreeableness, 50),
  COALESCE(personality_neuroticism, 50)
)
WHERE personality_completed_at IS NOT NULL
  AND personality_type IS NULL;
