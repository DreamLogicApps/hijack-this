ALTER TABLE current_link ADD COLUMN IF NOT EXISTS slot_type TEXT DEFAULT 'main';
ALTER TABLE hijack_history ADD COLUMN IF NOT EXISTS slot_type TEXT DEFAULT 'main';

-- Insert default rows for left ad slots
INSERT INTO current_link (url, label, hijack_price, owner_name, slot_type)
SELECT 'https://hackrank.lol', 'Ad Spot Available', 3.00, 'System', 'ad_left_1'
WHERE NOT EXISTS (SELECT 1 FROM current_link WHERE slot_type = 'ad_left_1');

INSERT INTO current_link (url, label, hijack_price, owner_name, slot_type)
SELECT 'https://hackrank.lol', 'Ad Spot Available', 2.00, 'System', 'ad_left_2'
WHERE NOT EXISTS (SELECT 1 FROM current_link WHERE slot_type = 'ad_left_2');

INSERT INTO current_link (url, label, hijack_price, owner_name, slot_type)
SELECT 'https://hackrank.lol', 'Ad Spot Available', 1.00, 'System', 'ad_left_3'
WHERE NOT EXISTS (SELECT 1 FROM current_link WHERE slot_type = 'ad_left_3');

-- Insert default rows for right ad slots
INSERT INTO current_link (url, label, hijack_price, owner_name, slot_type)
SELECT 'https://hackrank.lol', 'Ad Spot Available', 3.00, 'System', 'ad_right_1'
WHERE NOT EXISTS (SELECT 1 FROM current_link WHERE slot_type = 'ad_right_1');

INSERT INTO current_link (url, label, hijack_price, owner_name, slot_type)
SELECT 'https://hackrank.lol', 'Ad Spot Available', 2.00, 'System', 'ad_right_2'
WHERE NOT EXISTS (SELECT 1 FROM current_link WHERE slot_type = 'ad_right_2');

INSERT INTO current_link (url, label, hijack_price, owner_name, slot_type)
SELECT 'https://hackrank.lol', 'Ad Spot Available', 1.00, 'System', 'ad_right_3'
WHERE NOT EXISTS (SELECT 1 FROM current_link WHERE slot_type = 'ad_right_3');
