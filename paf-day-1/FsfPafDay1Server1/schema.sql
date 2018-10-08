create database fsf_paf_day1_db1;
use fsf_paf_day1_db1;

create table rsvp (
    email       varchar(64) not null,
    given_name  varchar(64) not null,
    phone       varchar(20) not null,
    attending   enum('yes', 'no') not null,
    remarks     text,

    primary key(email)
);