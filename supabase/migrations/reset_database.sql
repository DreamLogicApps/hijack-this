-- 1. Wipe all existing data completely
DELETE FROM hijack_history;
DELETE FROM current_link;

-- 2. Insert the Main Takeover Spot
INSERT INTO current_link (url, label, hijack_price, owner_name, clicks, slot_type)
VALUES ('https://hackrank.lol', 'The Internet''s Forgotten Scraps', 5.00, 'System Admin', 0, 'main');

INSERT INTO hijack_history (url, label, owner_name, price_paid, clicks, slot_type)
VALUES ('https://hackrank.lol', 'The Internet''s Forgotten Scraps', 'System Admin', 5.00, 0, 'main');

-- 3. Insert Left Ad Slots
INSERT INTO current_link (url, label, hijack_price, owner_name, slot_type, clicks)
VALUES 
('https://hackrank.lol', 'Ad Spot Available', 3.00, 'System', 'ad_left_1', 0),
('https://hackrank.lol', 'Ad Spot Available', 2.00, 'System', 'ad_left_2', 0),
('https://hackrank.lol', 'Ad Spot Available', 1.00, 'System', 'ad_left_3', 0);

-- 4. Insert Right Ad Slots
INSERT INTO current_link (url, label, hijack_price, owner_name, slot_type, clicks)
VALUES 
('https://hackrank.lol', 'Ad Spot Available', 3.00, 'System', 'ad_right_1', 0),
('https://hackrank.lol', 'Ad Spot Available', 2.00, 'System', 'ad_right_2', 0),
('https://hackrank.lol', 'Ad Spot Available', 1.00, 'System', 'ad_right_3', 0);
