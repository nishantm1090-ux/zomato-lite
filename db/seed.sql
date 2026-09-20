INSERT INTO restaurants (id, name, cuisine, area)
VALUES (1, 'Ludhiana Burrito', 'Indian', 'Sector 32');

SELECT setval(pg_get_serial_sequence('restaurants', 'id'), 1, true);

INSERT INTO reviews (id, restaurant_id, rating, comment, created_at) VALUES
  (101, 1, 5, 'Paneer burrito is unreal', NOW() - INTERVAL '8 days'),
  (102, 1, 4, 'Good, but slow service', NOW() - INTERVAL '6 days'),
  (103, 1, 4, 'Solid. Would repeat.', NOW() - INTERVAL '2 days');

SELECT setval(pg_get_serial_sequence('reviews', 'id'), 103, true);