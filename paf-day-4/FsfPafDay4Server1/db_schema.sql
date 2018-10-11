CREATE TABLE rsvp (
    email VARCHAR(64) NOT NULL,
    given_name VARCHAR(64) NOT NULL,
    phone VARCHAR(20),
    attending ENUM('true', 'false') NOT NULL,
    PRIMARY KEY (email)
);