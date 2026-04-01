-- Add product source URL and cached image URL to shipment items
ALTER TABLE shipment_items ADD COLUMN source_url TEXT;
ALTER TABLE shipment_items ADD COLUMN image_url TEXT;
