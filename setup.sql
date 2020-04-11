create table verification_table (code varchar(6), exp_date datetime, email_phone varchar(70), constraint verification_table_pk primary key (email_phone));
create table profile_information (uuid char(36) not null, picture_id char(36), email_phone text not null, user_name text not null, contacts mediumblob, constraint profile_information_pk primary key (uuid));
create table chat (uuid char(36), picture_id char(36), name text not null, constraint chat_pk primary key (uuid));
create table chat_members (cuuid char(36), uuid char(36), constraint chat_members_pk primary key (cuuid, uuid));
create table chat_messages (uuid char(36), message_type tinyint, content text, message_sent datetime, sender char(36), constraint chat_messages_pk primary key (uuid, message_sent));
create table pictures (uuid char(36), content mediumblob, contrainst pictures_pk primary key (uuid));