-- Drop foreign keys first to allow changing column types
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_user_id_fkey;
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_user_id_fkey;
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_category_id_fkey;
ALTER TABLE income DROP CONSTRAINT IF EXISTS income_user_id_fkey;
ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_user_id_fkey;
ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_category_id_fkey;

-- Alter column types
ALTER TABLE users ALTER COLUMN id TYPE VARCHAR(36);

ALTER TABLE categories ALTER COLUMN id TYPE VARCHAR(36);
ALTER TABLE categories ALTER COLUMN user_id TYPE VARCHAR(36);

ALTER TABLE expenses ALTER COLUMN id TYPE VARCHAR(36);
ALTER TABLE expenses ALTER COLUMN user_id TYPE VARCHAR(36);
ALTER TABLE expenses ALTER COLUMN category_id TYPE VARCHAR(36);

ALTER TABLE income ALTER COLUMN id TYPE VARCHAR(36);
ALTER TABLE income ALTER COLUMN user_id TYPE VARCHAR(36);

ALTER TABLE budgets ALTER COLUMN id TYPE VARCHAR(36);
ALTER TABLE budgets ALTER COLUMN user_id TYPE VARCHAR(36);
ALTER TABLE budgets ALTER COLUMN category_id TYPE VARCHAR(36);

-- Restore foreign keys
ALTER TABLE categories ADD CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE expenses ADD CONSTRAINT expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE expenses ADD CONSTRAINT expenses_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE income ADD CONSTRAINT income_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE budgets ADD CONSTRAINT budgets_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE budgets ADD CONSTRAINT budgets_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
