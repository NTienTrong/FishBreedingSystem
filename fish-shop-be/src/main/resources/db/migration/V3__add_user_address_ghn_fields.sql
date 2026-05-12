ALTER TABLE user_addresses
    ADD COLUMN receiver_name VARCHAR(100),
    ADD COLUMN phone_number VARCHAR(15),
    ADD COLUMN province_id INTEGER,
    ADD COLUMN district_id INTEGER,
    ADD COLUMN ward_code VARCHAR(20),
    ADD COLUMN province_name VARCHAR(100),
    ADD COLUMN district_name VARCHAR(100),
    ADD COLUMN ward_name VARCHAR(100),
    ADD COLUMN street_address TEXT;

UPDATE user_addresses
SET receiver_name = COALESCE(receiver_name, label, ''),
    phone_number = COALESCE(phone_number, phone, ''),
    street_address = COALESCE(street_address, address, ''),
    province_name = COALESCE(province_name, ''),
    district_name = COALESCE(district_name, ''),
    ward_name = COALESCE(ward_name, ''),
    ward_code = COALESCE(ward_code, ''),
    province_id = COALESCE(province_id, 0),
    district_id = COALESCE(district_id, 0);
