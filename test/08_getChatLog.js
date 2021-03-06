require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();
const mockSession = require('mock-session');

chai.use(chaiHttp);

let user1 = mockSession('session', `${process.env.SESSIONKEY}`, {"user_ID":1});
let user2 = mockSession('session', `${process.env.SESSIONKEY}`, {"user_ID":2});
let user3 = mockSession('session', `${process.env.SESSIONKEY}`, {"user_ID":3});

describe('/chats/:user_name GET "user get chat log"', () => {
  it('should not allow user to get chat log if not log in', (done) => {
    chai.request(server)
      .get('/chats/Garfield')
      .end((e, res) => {
        res.should.have.status(403);
        res.body[0].err.should.equal('Please login');
        done();
      });
  });

  it('should allow user to get chat log if all require is met', (done) => {
    chai.request(server)
      .get('/chats/Garfield')
      .set('cookie', [user1])
      .end((e, res) => {
        res.should.have.status(200);
        res.body.length.should.equal(2);
        done();
      });
  });

  it('should return err msg if users never chat before', (done) => {
    chai.request(server)
      .get('/chats/Jimmy Mu')
      .set('cookie', [user3])
      .end((e, res) => {
        res.should.have.status(200);
        res.body[0].msg.should.equal('empty chat');
        done();
      });
  });
  it('should return err msg if users trying to chat with himself', (done) => {
    chai.request(server)
      .get('/chats/Garfield')
      .set('cookie', [user2])
      .end((e, res) => {
        res.should.have.status(403);
        res.body[0].err.should.equal('same user');
        done();
      });
  });
});