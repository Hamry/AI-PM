ALTER TABLE tasks
ADD user_id INTEGER references users(id);