-- ============================================================
-- FIX DB SCHEMA ERROR FIRST
-- The trigger update_business_analytics() fails because 
-- product_id is not unique in business_analytics.
-- We fix it before inserting data:
-- ============================================================
ALTER TABLE business_analytics DROP CONSTRAINT IF EXISTS unique_product_analytics;
ALTER TABLE business_analytics ADD CONSTRAINT unique_product_analytics UNIQUE (product_id);

-- ============================================================
-- BRAND NEW SEED DATA — 5 rows in EVERY table
-- ============================================================

-- ─────────────────────────────────────────────────────
-- 1. USERS1 (3 clients + 2 businesses)
-- ─────────────────────────────────────────────────────
INSERT INTO users1 (id, name, email, password, phone, role) VALUES
  ('a2000000-0000-0000-0000-000000000001', 'Arjun Singh',   'arjun.new@example.com',   'managed_by_supabase_auth', '+919000000001', 'client'),
  ('a2000000-0000-0000-0000-000000000002', 'Sneha Reddy',   'sneha.new@example.com',   'managed_by_supabase_auth', '+919000000002', 'client'),
  ('a2000000-0000-0000-0000-000000000003', 'Vikram Das',    'vikram.new@example.com',  'managed_by_supabase_auth', '+919000000003', 'client'),
  ('a2000000-0000-0000-0000-000000000004', 'Urban Books',   'books.new@example.com',   'managed_by_supabase_auth', '+919000000004', 'business'),
  ('a2000000-0000-0000-0000-000000000005', 'FitGear Pro',   'fitgear.new@example.com', 'managed_by_supabase_auth', '+919000000005', 'business')
ON CONFLICT (email) DO NOTHING;


-- ─────────────────────────────────────────────────────
-- 2. CLIENTS (3 rows)
-- ─────────────────────────────────────────────────────
INSERT INTO clients (id, user_id, address) VALUES
  ('b2000000-0000-0000-0000-000000000001', (SELECT id FROM users1 WHERE email='arjun.new@example.com'), 'Sector 62, Noida'),
  ('b2000000-0000-0000-0000-000000000002', (SELECT id FROM users1 WHERE email='sneha.new@example.com'), 'Banjara Hills, Hyderabad'),
  ('b2000000-0000-0000-0000-000000000003', (SELECT id FROM users1 WHERE email='vikram.new@example.com'), 'Salt Lake, Kolkata')
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────
-- 3. BUSINESSES (2 rows)
-- ─────────────────────────────────────────────────────
INSERT INTO businesses (id, user_id, business_name, category, location) VALUES
  ('c2000000-0000-0000-0000-000000000001', (SELECT id FROM users1 WHERE email='books.new@example.com'), 'Urban Books Store', 'Books & Stationary', 'Connaught Place, Delhi'),
  ('c2000000-0000-0000-0000-000000000002', (SELECT id FROM users1 WHERE email='fitgear.new@example.com'), 'FitGear Pro Hub',   'Fitness & Sports',    'Juhu, Mumbai')
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────
-- 4. CATEGORIES (5 rows)
-- ─────────────────────────────────────────────────────
INSERT INTO categories (name) VALUES
  ('Books & Stationary'),
  ('Fitness & Sports'),
  ('Toys & Games'),
  ('Automotive Accessories'),
  ('Pet Supplies')
ON CONFLICT (name) DO NOTHING;


-- ─────────────────────────────────────────────────────
-- 5. PRODUCTS1 (5 rows)
-- ─────────────────────────────────────────────────────
INSERT INTO products1 (id, business_id, category_id, name, description, image_url, price, stock) VALUES
  ('e2000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000001', (SELECT id FROM categories WHERE name='Books & Stationary'), 'The Pragmatic Programmer', 'Classic software engineering book', 'https://picsum.photos/300/200?random=11', 2500, 15),
  ('e2000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000001', (SELECT id FROM categories WHERE name='Books & Stationary'), 'Moleskine Notebook',       'A5 dotted hardcover notebook',      'https://picsum.photos/300/200?random=12', 1200, 50),
  ('e2000000-0000-0000-0000-000000000003', 'c2000000-0000-0000-0000-000000000001', (SELECT id FROM categories WHERE name='Toys & Games'),       'Wooden Chess Set',         'Premium hand-crafted chess set',    'https://picsum.photos/300/200?random=13', 3500, 10),
  ('e2000000-0000-0000-0000-000000000004', 'c2000000-0000-0000-0000-000000000002', (SELECT id FROM categories WHERE name='Fitness & Sports'),   'Yoga Mat',                 'Non-slip 8mm yoga mat',             'https://picsum.photos/300/200?random=14', 999,  30),
  ('e2000000-0000-0000-0000-000000000005', 'c2000000-0000-0000-0000-000000000002', (SELECT id FROM categories WHERE name='Fitness & Sports'),   'Dumbbell Set 10kg',        'Adjustable home gym dumbbell set',  'https://picsum.photos/300/200?random=15', 2999, 20)
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────
-- 6. CART_ITEMS (5 rows)
-- ─────────────────────────────────────────────────────
INSERT INTO cart_items (id, client_id, product_id, quantity) VALUES
  ('f2000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001', 'e2000000-0000-0000-0000-000000000001', 1),
  ('f2000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000001', 'e2000000-0000-0000-0000-000000000002', 2),
  ('f2000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000002', 'e2000000-0000-0000-0000-000000000004', 1),
  ('f2000000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000003', 'e2000000-0000-0000-0000-000000000003', 1),
  ('f2000000-0000-0000-0000-000000000005', 'b2000000-0000-0000-0000-000000000003', 'e2000000-0000-0000-0000-000000000005', 1)
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────
-- 7. ORDERS1 (5 rows)
-- ─────────────────────────────────────────────────────
INSERT INTO orders1 (id, client_id, business_id, total_amount, status, created_at) VALUES
  ('11200000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000001', 4900, 'completed',  NOW() - INTERVAL '40 days'),
  ('11200000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000001', 3500, 'shipped',    NOW() - INTERVAL '25 days'),
  ('11200000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000002', 999,  'processing', NOW() - INTERVAL '12 days'),
  ('11200000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000003', 'c2000000-0000-0000-0000-000000000002', 2999, 'pending',    NOW() - INTERVAL '2 days'),
  ('11200000-0000-0000-0000-000000000005', 'b2000000-0000-0000-0000-000000000003', 'c2000000-0000-0000-0000-000000000001', 1200, 'cancelled',  NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────
-- 8. ORDER_ITEMS (5 rows)
-- THIS WILL TRIGGER update_business_analytics()
-- Which now works because of the ALTER TABLE at the top!
-- ─────────────────────────────────────────────────────
INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES
  ('12200000-0000-0000-0000-000000000001', '11200000-0000-0000-0000-000000000001', 'e2000000-0000-0000-0000-000000000001', 1, 2500),
  ('12200000-0000-0000-0000-000000000002', '11200000-0000-0000-0000-000000000001', 'e2000000-0000-0000-0000-000000000002', 2, 1200),
  ('12200000-0000-0000-0000-000000000003', '11200000-0000-0000-0000-000000000002', 'e2000000-0000-0000-0000-000000000003', 1, 3500),
  ('12200000-0000-0000-0000-000000000004', '11200000-0000-0000-0000-000000000003', 'e2000000-0000-0000-0000-000000000004', 1, 999),
  ('12200000-0000-0000-0000-000000000005', '11200000-0000-0000-0000-000000000004', 'e2000000-0000-0000-0000-000000000005', 1, 2999)
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────
-- 9. PAYMENTS (5 rows)
-- ─────────────────────────────────────────────────────
INSERT INTO payments (id, order_id, payment_method, payment_status, transaction_id) VALUES
  ('13200000-0000-0000-0000-000000000001', '11200000-0000-0000-0000-000000000001', 'Wallet',      'completed', 'TXN_WAL_001'),
  ('13200000-0000-0000-0000-000000000002', '11200000-0000-0000-0000-000000000002', 'Credit Card', 'completed', 'TXN_CC_002'),
  ('13200000-0000-0000-0000-000000000003', '11200000-0000-0000-0000-000000000003', 'Net Banking', 'pending',   'TXN_NB_003'),
  ('13200000-0000-0000-0000-000000000004', '11200000-0000-0000-0000-000000000004', 'UPI',         'pending',   'TXN_UPI_004'),
  ('13200000-0000-0000-0000-000000000005', '11200000-0000-0000-0000-000000000005', 'Debit Card',  'failed',    'TXN_DC_005')
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────
-- 10. REVIEWS (5 rows)
-- ─────────────────────────────────────────────────────
INSERT INTO reviews (id, product_id, client_id, rating, comment) VALUES
  ('14200000-0000-0000-0000-000000000001', 'e2000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001', 5, 'A must-read for every developer!'),
  ('14200000-0000-0000-0000-000000000002', 'e2000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000001', 4, 'Great paper quality, but a bit pricey.'),
  ('14200000-0000-0000-0000-000000000003', 'e2000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000002', 5, 'Beautifully crafted wooden pieces.'),
  ('14200000-0000-0000-0000-000000000004', 'e2000000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000001', 4, 'Good grip and comfortable thickness.'),
  ('14200000-0000-0000-0000-000000000005', 'e2000000-0000-0000-0000-000000000005', 'b2000000-0000-0000-0000-000000000003', 4, 'Solid build, great for home workouts.')
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────
-- 11. NOTIFICATIONS (5 rows)
-- ─────────────────────────────────────────────────────
INSERT INTO notifications (id, user_id, message, is_read) VALUES
  ('15200000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000001', 'Welcome Arjun! Check out the new arrivals.', true),
  ('15200000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000001', 'Your order #11200001 has been delivered!', false),
  ('15200000-0000-0000-0000-000000000003', 'a2000000-0000-0000-0000-000000000004', 'Your business profile is now active on SmallBizzHub.', true),
  ('15200000-0000-0000-0000-000000000004', 'a2000000-0000-0000-0000-000000000004', 'New order #11200002 waiting to be shipped!', false),
  ('15200000-0000-0000-0000-000000000005', 'a2000000-0000-0000-0000-000000000005', 'New order #11200003 waiting to be shipped!', false)
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────
-- 12. STOCK_HISTORY (5 rows)
-- ─────────────────────────────────────────────────────
INSERT INTO stock_history (id, product_id, change_amount, reason) VALUES
  ('16200000-0000-0000-0000-000000000001', 'e2000000-0000-0000-0000-000000000001',  15, 'Initial stock added'),
  ('16200000-0000-0000-0000-000000000002', 'e2000000-0000-0000-0000-000000000001',  -1, 'Sold 1 unit(s) — Order #11200001'),
  ('16200000-0000-0000-0000-000000000003', 'e2000000-0000-0000-0000-000000000002',  50, 'Initial stock added'),
  ('16200000-0000-0000-0000-000000000004', 'e2000000-0000-0000-0000-000000000004',  30, 'Initial stock added'),
  ('16200000-0000-0000-0000-000000000005', 'e2000000-0000-0000-0000-000000000003',  -1, 'Sold 1 unit(s) — Order #11200002')
ON CONFLICT (id) DO NOTHING;

-- NOTE: There is no manual insert into business_analytics 
-- because the order_items insert naturally triggered the function
-- and created those rows for us!
