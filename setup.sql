create table verification_table (code varchar(6), exp_date datetime, email_phone varchar(70), constraint verification_table_pk primary key (email_phone));
create table profile_information (uuid char(36) not null, picture_id varchar(36), email_phone text not null, user_name text not null, contacts mediumblob, constraint profile_information_pk primary key (uuid));
