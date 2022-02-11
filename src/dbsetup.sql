-- SQLite
CREATE TABLE if not exists `quotes`
(
    `id`            INTEGER PRIMARY KEY AUTOINCREMENT,
    `quote_text`    TEXT NOT NULL,
    `creation_date` TEXT,
    `alias`         TEXT
);

CREATE TABLE if not exists `commands`
(
    `name`             TEXT    NOT NULL,
    `response`         TEXT    NOT NULL DEFAULT '',
    `channel_cooldown` INTEGER NOT NULL DEFAULT 15,
    `user_cooldown`    INTEGER NOT NULL DEFAULT 15,
    `mod_only`         INTEGER NOT NULL DEFAULT 0,
    `broadcaster_only` INTEGER NOT NULL DEFAULT 0,
    `enabled`          INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (name)
);

CREATE TABLE if not exists "timedmessages"
(
    `id`       INTEGER PRIMARY KEY AUTOINCREMENT,
    `message`  TEXT    NOT NULL DEFAULT '',
    `inittime` INTEGER NOT NULL DEFAULT 0,
    `looptime` INTEGER NOT NULL DEFAULT 0,
    `enabled`  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE if not exists "eightball"
(
    `id`       INTEGER PRIMARY KEY AUTOINCREMENT,
    `response` TEXT NOT NULL DEFAULT ''
);
