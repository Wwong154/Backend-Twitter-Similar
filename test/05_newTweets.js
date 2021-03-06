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
let user3 = mockSession('session', `${process.env.SESSIONKEY}`, {"user_ID":3});

describe('/users/:user_id/tweets POST "user make new tweet"', () => {
  it('should allow user to tweet meeting all requirement', (done) => {
    chai.request(server)
      .post('/users/Trex/tweets')
      .set('cookie', [user1])
      .type('form')
      .send({
        'tweet': 'Breakfast time'
      })
      .end((e, res) => {
        res.should.have.status(200);
        res.body.length.should.equal(1);
        res.body[0].content.should.equal('Breakfast time');
        done();
      });
  });

  it('should reject as tweet is too long', (done) => {
    chai.request(server)
      .post('/users/Trex/tweets')
      .set('cookie', [user1])
      .type('form')
      .send({
        'tweet': 'Breakfast timeBreakfast timeBreakfast timeBreakfast timeBreakfast timeBreakfast timeBreakfast timeBreakfast timeBreakfast timeBreakfast timeBreakfast timeBreakfast timeBreakfast timeBreakfast timeBreakfast timeBreakfast timeBreakfast timeBreakfast timeBreakfast time'
      })
      .end((e, res) => {
        res.should.have.status(403);
        res.body[0].err.should.equal('tweet is too long');
        done();
      });
  });

  it('should reject as user session does not match user_ID', (done) => {
    chai.request(server)
      .post('/users/Trex/tweets')
      .set('cookie', [user3])
      .send({
        'tweet': 'Dinner time'
      })
      .end((e, res) => {
        res.should.have.status(403);
        res.body[0].err.should.equal('user not auth');
        done();
      });
  });

  it('should reject as user have no session (not login)', (done) => {
    chai.request(server)
      .post('/users/Trex/tweets')
      .send({
        'tweet': 'lunch time'
      })
      .end((e, res) => {
        res.should.have.status(403);
        res.body[0].err.should.equal('user not login');
        done();
      });
  });

  it('should reject as user enter empty tweet', (done) => {
    chai.request(server)
      .post('/users/Trex/tweets')
      .set('cookie', [user1])
      .end((e, res) => {
        res.should.have.status(403);
        res.body[0].err.should.equal('tweet is empty');
        done();
      });
  });
});