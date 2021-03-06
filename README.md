# How to run
1. Create .env.development with the following
 - DB_HOST
 - DB_USER
 - DB_PASS
 - DB_NAME
 - DB_PORT
 - PORT
 - SOCKETPORT
 - SESSIONKEY
 - SESSIONKEY2

2. ```npm i``` install all dependancies

3. ```npm test``` for testing or ```npm start``` to start server

# Task
Section 1 - Complete
  - login
  - registration

Section 2 - Complete
  - Live chat
  - Tweet (read, create, update, delete)

Section 3 - Not commence

# Summary
This is a backend only server that lightly resemble twitter.

## Used
Used JS, Node and Express for server.
Cookie-session for session.
Bcrypt for hashing
PSQL for DB.
Socket.io to handle livechat.

## Test
Test should have cover most cases.
Every end point other then '/' and '/tweets/:count' have it own test.
Those 2 link's test are included in other test.

## What is missing
 - Does not have test for socket inside a page due to chai request issue
 - Socket does not actually take in cookie as front end page is missing and I have issue with mocking a header with cookie
 - Does not have test target on single helper function
 - Utilize .env, it is set up, but never use beside development
 - Some column of table is not utilize yet
 - Refactoring of code to improve performance

# ERD
Probably can remove conversations table, but time...

| users          | Type  |
|:------------------|:------------|
| id       | PK |
|name          | varchar(255)|
|    pssword       |varchar(255)|
|     unread_msg      | boolean|

| conversations          | Type  |
|:------------------|:------------|
| id       | PK |
|user1_id          | FK(users.id)|
|    user2_id       |FK(users.id)|

| msgs          | Type  |
|:------------------|:------------|
| id       | PK |
|conversation_id          | FK(conversation.id)|
|    from_id       |FK(users.id)|
|    to_id       |FK(users.id)|
|    content       |varchar(255)|
|    send_date       |Date|

| tweets          | Type  |
|:------------------|:------------|
| id       | PK |
|user_id          | FK(users.id)|
|    content       |varchar(255)|
|edit |boolean|
|last_update_date|date|
|    tweet_date       |Date|


# ROUTES

| Route                                   | HTTP Verb          | Description  |
| ----------------------------------------|:------------------:| ------------:|
| /                                       | GET                | HomePage     |
| /tweets/                            | GET                | Get some tweet|
| /tweets/:count                   | POST               | Get more tweet|
| /tweets/:tweet_id                    | GET               | get that 1 tweet |
| /users/                     | POST                | register new user |
| /users/:user_name/tweets           | POST               | post new tweet     |
| /users/:user_name/tweets           | GET               | Get tweets of that user    |
| /users/:user_name/tweets/:tweet_id           | PUT               | post new tweet if owner    |
| /users/:user_name/tweets/:tweet_id           | DELETE               | delete tweet if owner     |
| /session           | POST               | login     |
| /session           | DETELE               | logout     |
| /chat/:user_name           | GET               | Get chat log between user     |
| /chat/:user_name           | POST               | Post new msg between user     |