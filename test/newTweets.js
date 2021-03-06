const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();
const mockSession = require('mock-session');


chai.use(chaiHttp);

describe('/users/:user_id/tweets POST "user make new tweet"', () => {
  it('should reject', (done) => {
    chai.request(server)
      .post('/users/1/tweets')
      .end((e, res) => {
        res.should.have.status(403);
        res.body.should.be.a('object');
        res.body.err.should.equal('user not login');
        done();
      });
  });
});