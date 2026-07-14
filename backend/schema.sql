CREATE TYPE CURRENCY_TYPE AS ENUM ('PKR', 'USD');
CREATE TYPE AD_TYPE AS ENUM ('FEATURED', 'SPONSERED');

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    password_changed_at BIGINT NOT NULL DEFAULT 0 CHECK(password_changed_at >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tours_completed INT NOT NULL DEFAULT 0 CHECK(tours_completed >= 0),
    profile_url VARCHAR(300)
);


CREATE TABLE locations (
    location_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    cover_image_url VARCHAR(300) NOT NULL,
    tour_image_id INT UNIQUE,
    address VARCHAR(100) NOT NULL,
    rating NUMERIC(3,2) NOT NULL DEFAULT 3.50 CHECK(rating >= 0.00 AND rating <= 5.00),
    total_views BIGINT NOT NULL DEFAULT 0 CHECK(total_views >= 0),
    today_views BIGINT NOT NULL DEFAULT 0 CHECK(today_views >= 0),
    coordinate_x NUMERIC(10,7) NOT NULL,
    coordinate_y NUMERIC(10,7) NOT NULL
);

CREATE TABLE bookmarks (
    user_id INT,
    location_id INT,

    CONSTRAINT pkey_bookmarks PRIMARY KEY (user_id, location_id),
    CONSTRAINT fkey_bookmarks_userid FOREIGN KEY (user_id) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fkey_bookmarks_locationid FOREIGN KEY (location_id) REFERENCES locations(location_id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE tour_images (
    image_id SERIAL PRIMARY KEY,
    image_url VARCHAR(300) NOT NULL,
    left_image_id INT,
    right_image_id INT,
    forward_image_id INT,
    backward_image_id INT,

    CONSTRAINT fkey_tourimages_leftimageid FOREIGN KEY (left_image_id) REFERENCES tour_images(image_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fkey_tourimages_rightimageid FOREIGN KEY (right_image_id) REFERENCES tour_images(image_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fkey_tourimages_forwardimageid FOREIGN KEY (forward_image_id) REFERENCES tour_images(image_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fkey_tourimages_backwardimageid FOREIGN KEY (backward_image_id) REFERENCES tour_images(image_id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE ads (
    ad_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    company VARCHAR(100) NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    currency CURRENCY_TYPE NOT NULL,
    image_url VARCHAR(300) NOT NULL,
    redirect_url VARCHAR(300) NOT NULL,
    is_verified SMALLINT DEFAULT 1,
    ad_category AD_TYPE NOT NULL DEFAULT 'FEATURED'
);

CREATE TABLE reviews (
    user_id INT,
    location_id INT,
    rating INT NOT NULL CHECK(rating >= 1 AND rating <= 5),
    description VARCHAR(5000) NOT NULL,

    CONSTRAINT pkey_reviews PRIMARY KEY (user_id, location_id),
    CONSTRAINT fkey_reviews_userid FOREIGN KEY (user_id) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fkey_reviews_locationid FOREIGN KEY (location_id) REFERENCES locations(location_id) ON UPDATE CASCADE ON DELETE CASCADE
);


CREATE TABLE hashtags (
    ad_id INT,
    tag VARCHAR(20),

    CONSTRAINT pkey_hashtags PRIMARY KEY (ad_id, tag),
    CONSTRAINT fkey_hashtags_adid FOREIGN KEY (ad_id) REFERENCES ads(ad_id) ON UPDATE CASCADE ON DELETE CASCADE
);



-- TODO:
-- TRIGGER to update the rating of the Location, if the REVIEW is INSERTED