-- Up
create table page (
  id integer PRIMARY KEY
, url text NOT NULL
, title text NOT NULL
, text text NOT NULL
, timestamp INTEGER not NULL
);

create table meta (
  id integer PRIMARY KEY
, page_id integer NOT NULL REFERENCES page(id)
, type text NOT NULL
, key text NOT NULL
, content text NOT NULL
);

-- Down
drop table if exists meta;
drop table if exists page;
