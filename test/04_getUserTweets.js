require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();

chai.use(chaiHttp);

describe('/users/:user_id/tweets GET "user make new tweet"', () => {
  it('should allow user view a person tweet if that user exist', (done) => {
    chai.request(server)
      .get('/users/Garfield/tweets')
      .end((e, res) => {
        res.should.have.status(200);
        res.body[0].content.should.equal('I hit my head ');
        done();
      });
  });

  it('should return error if trying to view tweet from user that does not exist', (done) => {
    chai.request(server)
      .get('/users/1/tweets')
      .end((e, res) => {
        res.should.have.status(403);
        res.body[0].err.should.equal('user does not exist');
        done();
      });
  });
});