ALTER TABLE t_p4903350_kedoo_music_distribu.releases ADD COLUMN IF NOT EXISTS trash_status TIMESTAMP WITHOUT TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_releases_trash_status ON t_p4903350_kedoo_music_distribu.releases(trash_status);