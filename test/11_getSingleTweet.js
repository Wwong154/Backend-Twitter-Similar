require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();

chai.use(chaiHttp);

describe('/tweets/:tweet_id Get "get that 1 tweet"', () => {
  it('should get that 1 tweet if exist', (done) => {
    chai.request(server)
      .get('/tweets/2')
      .end((e, res) => {
        res.should.have.status(200);
        res.body[0].content.should.equal('Jambalaya b');
        done();
      });
  });

  it('should allow user to process if login', (done) => {
    chai.request(server)
      .get('/tweets/200')
      .end((e, res) => {
        res.should.have.status(403);
        res.body[0].err.should.equal('tweet does not exist');
        done();
      });
  });
});