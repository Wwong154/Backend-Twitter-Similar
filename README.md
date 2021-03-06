## Summary

## ERD

## ROUTES

| Route                                   | HTTP Verb          | Description  |
| ----------------------------------------|:------------------:| ------------:|
| /                                       | GET                | HomePage     |
| /tweets/                            | GET                | Get some tweet|
| /tweets/:count                   | POST               | Get more tweet|
| /tweets/:user_name                     | GET               | get tweets from that user |
| /users/                     | POST                | register new user |
| /users/:user_name/tweets           | POST               | post new tweet     |
| /users/:user_name/tweets/:tweet_id           | PUT               | post new tweet if owner    |
| /users/:user_name/tweets/:tweet_id           | DELETE               | delete tweet if owner     |
| /session           | POST               | login     |
| /session           | DETELE               | logout     |
| /chat/:user_name           | GET               | Get chat log between user     |
| /chat/:user_name           | POST               | Post new msg between user     |

## 