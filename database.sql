CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  username VARCHAR(60) NOT NULL UNIQUE,
  password_hash CHAR(64) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'client',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quotes (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(120) NOT NULL,
  country_of_departure VARCHAR(80) NOT NULL,
  adults INTEGER NOT NULL,
  children INTEGER NOT NULL,
  children_ages JSON,
  destination VARCHAR(80) NOT NULL,
  parks JSON,
  cruises JSON,
  specific_beach VARCHAR(120),
  lodging VARCHAR(120),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  specifications TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  admin_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_quotes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT quotes_date_order CHECK (end_date >= start_date)
);

CREATE INDEX quotes_user_id_idx ON quotes(user_id);
CREATE INDEX quotes_status_idx ON quotes(status);

-- Usuario administrador inicial. La contraseña se guarda como SHA-256.
INSERT INTO users (id, name, username, password_hash, role)
VALUES ('admin-andrea-lugo', 'Andrea Lugo', 'AndreaLugo',
        '21361d1d4baaf37c4f3213629ff141c5ceb9e18bcd0f763a95c97b834065803e',
        'admin');
