create table verification_table (code varchar(6), exp_date datetime, email_phone varchar(70), constraint verification_table_pk primary key (email_phone));
create table profile_information (uuid char(36) not null, picture_id char(36), email_phone text not null, user_name text not null, contacts mediumblob, constraint profile_information_pk primary key (uuid));
create table chat (uuid char(36), picture_id char(36), chat_name text not null, constraint chat_pk primary key (uuid));
create table chat_members (cuuid char(36), uuid char(36), constraint chat_members_pk primary key (cuuid, uuid));
create table chat_messages (uuid char(36), message_type tinyint, content text, message_sent datetime, sender char(36), constraint chat_messages_pk primary key (uuid, message_sent));
<<<<<<< HEAD
create table pictures (uuid char(36), content mediumblob, constraint pictures_pk primary key (uuid));
create table unread_messages (cuuid char(36), message_sent datetime, uuid char(36) constraint unread_messages_pk primary key (cuuid, message_send uuid));
=======
create table pictures (uuid char(36), content mediumblob, constraint pictures_pk primary key (uuid));
>>>>>>> be265e12226959dd11bd93aa0d184b47586fd2d9
