-- Storefront reference DDL. SQLAlchemy creates these at startup; this file
-- is the canonical reference for the normalized schema and the indexes
-- that drive the catalog/order hot paths.

CREATE TABLE users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(120) NOT NULL,
    role            ENUM('customer','admin') NOT NULL DEFAULT 'customer',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX ix_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE categories (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(80) NOT NULL,
    slug        VARCHAR(80) NOT NULL UNIQUE,
    description TEXT
) ENGINE=InnoDB;

CREATE TABLE products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    slug        VARCHAR(220) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price       DECIMAL(10,2) NOT NULL,
    stock       INT NOT NULL DEFAULT 0,
    image_url   VARCHAR(500),
    category_id INT NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX ix_products_category_created (category_id, created_at),
    INDEX ix_products_price (price)
) ENGINE=InnoDB;

CREATE TABLE cart_items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    product_id  INT NOT NULL,
    quantity    INT NOT NULL DEFAULT 1,
    UNIQUE KEY uq_cart_user_product (user_id, product_id),
    INDEX ix_cart_user (user_id),
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE orders (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    user_id           INT NOT NULL,
    status            ENUM('pending','paid','shipped','cancelled') NOT NULL DEFAULT 'pending',
    total             DECIMAL(10,2) NOT NULL,
    shipping_address  VARCHAR(500) NOT NULL,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX ix_orders_user_status (user_id, status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE order_items (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    order_id           INT NOT NULL,
    product_id         INT NOT NULL,
    quantity           INT NOT NULL,
    price_at_purchase  DECIMAL(10,2) NOT NULL,
    INDEX ix_order_items_order (order_id),
    FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
