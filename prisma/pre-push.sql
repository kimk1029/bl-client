-- Runs before `prisma db push` in the deploy pipeline.
-- Remaps obsolete PostTag values so the new enum cast doesn't fail.

DO $$
DECLARE
  invalid_count INTEGER := 0;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Post' AND column_name = 'tag'
  ) THEN
    EXECUTE 'SELECT COUNT(*) FROM "Post" WHERE "tag"::text NOT IN (''worship'',''prayer'',''life'',''faith'',''mission'',''youth'',''free'')'
      INTO invalid_count;

    IF invalid_count > 0 THEN
      ALTER TABLE "Post" ALTER COLUMN "tag" DROP DEFAULT;
      ALTER TABLE "Post" ALTER COLUMN "tag" TYPE text USING "tag"::text;
      UPDATE "Post"
        SET "tag" = 'free'
        WHERE "tag" NOT IN ('worship','prayer','life','faith','mission','youth','free');
      DROP TYPE IF EXISTS "PostTag";
    END IF;
  END IF;
END $$;
