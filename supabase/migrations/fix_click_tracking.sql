-- Fix increment_current_clicks to respect slot_type
CREATE OR REPLACE FUNCTION increment_current_clicks(row_id UUID)
RETURNS void AS $$
DECLARE
  v_slot_type TEXT;
BEGIN
  UPDATE current_link 
  SET clicks = clicks + 1 
  WHERE id = row_id 
  RETURNING slot_type INTO v_slot_type;
  
  -- Also update the latest hijack_history row for this slot_type so the clicks persist
  UPDATE hijack_history 
  SET clicks = clicks + 1 
  WHERE id = (SELECT id FROM hijack_history WHERE slot_type = v_slot_type ORDER BY created_at DESC LIMIT 1);
END;
$$ LANGUAGE plpgsql;
