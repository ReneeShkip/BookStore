create database Bookstore;
use Bookstore;

create table author(
	ID tinyint primary key auto_increment,
    first_name char(50) not null,
    last_name char(50) not null,
    biography text
);

create table books(
	ID tinyint primary key auto_increment,
    title char(30) not null,
    cover VARCHAR(255) not null,
    author tinyint not null,
    price decimal not null,
	annotation text,
    rate decimal(2,1) not null,
    type ENUM('Паперова', 'Електронна')  NOT NULL DEFAULT 'Паперова'
);

create table users(
	ID tinyint primary key auto_increment,
    first_name char(50) not null,
    last_name char(50) not null,
    login char(50) not null,
    `password` char(50) not null,
    phone_number char(10) not null
);

create table comments(
	ID tinyint primary key auto_increment,
    user_id tinyint,
    book_id tinyint,
    caption text,
    sub_rate decimal(2,1) not null,
    foreign key(user_id) REFERENCES users (ID) ON DELETE CASCADE,
    foreign key(book_id) REFERENCES books (ID) ON DELETE CASCADE
);