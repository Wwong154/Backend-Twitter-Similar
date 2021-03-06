## Summary

## ERD
| users          | Type  |
|:------------------:|------------:|
| id       | PK |
|name          | varchar(255)|
|    pssword       |varchar(255)|
|     unread_msg      | boolean|


## ROUTES

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

## 