-- Development fixtures only. Populates roles and the logins of the team databases (schema/users.sql).
--
-- The ids, roles, usernames, emails, and employees below are copied from pms.users as the developers
-- hold it, so every database shares them. Every seeded account signs in with the development
-- password Seed-Pass-2026. password_hash holds its bcrypt hash (cost 10, as the backend uses).
-- The real password of an account stays in the database that holds it: never put it in this file.
-- Never use these accounts or this password outside a local database.
--
--   id  username        role     employee
--   1   admin           ADMIN    admin (25)
--   4   admin001        ADMIN    ITI-001 (21)
--   8   manager         MANAGER  ITI-002 (26)
--   9   user            USER     ITI-003 (27)
--   10  lebronjames023  ADMIN    SIXERS-023 (24)

-- ---------------------------------------------------------------------------
-- 14. Roles and Users
-- ---------------------------------------------------------------------------

-- Id 1 is ADMIN_ROLE_ID in the backend. The codes are ROLE_CODES in @pms/shared-types.
INSERT INTO pms.user_role (id, code, name, created_at, updated_at)
VALUES
  (1, 'ADMIN', 'HR Admin', now(), now()),
  (2, 'MANAGER', 'Manager', now(), now()),
  (3, 'USER', 'Employee', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO pms.users (
    id, employee_id, user_role_id, email, username, password_hash,
    failed_login_attempts, login_locked_until, created_at, updated_at
)
VALUES
  (1, 25, 1, 'admin@hrdotnet.com', 'admin', '$2b$10$ZmihHjnemPnjn37cmY3LzuoPC6UswADN2neAsJqHATG.Khtnh5k6G', 0, NULL, now(), now()),
  (4, 21, 1, 'iging@hrdotnet.com', 'admin001', '$2b$10$ZmihHjnemPnjn37cmY3LzuoPC6UswADN2neAsJqHATG.Khtnh5k6G', 0, NULL, now(), now()),
  (8, 26, 2, 'iging@managerdotnet.com', 'manager', '$2b$10$ZmihHjnemPnjn37cmY3LzuoPC6UswADN2neAsJqHATG.Khtnh5k6G', 0, NULL, now(), now()),
  (9, 27, 3, 'iging@userdotnet.com', 'user', '$2b$10$ZmihHjnemPnjn37cmY3LzuoPC6UswADN2neAsJqHATG.Khtnh5k6G', 0, NULL, now(), now()),
  (10, 24, 1, 'lebronjames@gmail.com', 'lebronjames023', '$2b$10$ZmihHjnemPnjn37cmY3LzuoPC6UswADN2neAsJqHATG.Khtnh5k6G', 0, NULL, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Advance the identity past the explicit fixture ids.
SELECT setval(pg_get_serial_sequence('pms.users', 'id'), (SELECT max(id) FROM pms.users));
