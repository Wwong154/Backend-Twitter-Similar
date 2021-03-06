const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();

chai.use(chaiHttp);

describe('/GET "make sure test is working"', () => {
  it('get all tweets should return a array(length 2) of tweet', (done) => {
    chai.request(server)
      .get('/')
      .end((e, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.equal(2);
        done();
      });
  });
  it('get more tweets when ask for more tweet', (done) => {
    chai.request(server)
      .post('/tweets/1')
      .end((e, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.equal(2);
        done();
      });
  });
  it('get more tweets return an msg when there is no more tweet', (done) => {
    chai.request(server)
      .post('/tweets/1000')
      .end((e, res) => {
        res.should.have.status(403);
        res.body.should.be.a('object');
        res.body.msg.should.equal('no more tweet');
        done();
      });
  });
});