-- Up
create table page (
  id INTEGER PRIMARY KEY
, url TEXT NOT NULL
, title TEXT NOT NULL
, text TEXT NOT NULL
, timestamp INTEGER not NULL
);

create table meta (
  id INTEGER PRIMARY KEY
, page_id INTEGER NOT NULL REFERENCES page(id)
, type TEXT NOT NULL
, key TEXT NOT NULL
, content TEXT NOT NULL
);

create table image (
  id INTEGER PRIMARY key
, page_id INTEGER NOT NULL REFERENCES page(id)
, url TEXT NOT NULL
, alt TEXT NOT NULL
);

-- Down
drop table if exists image;
drop table if exists meta;
drop table if exists page;
