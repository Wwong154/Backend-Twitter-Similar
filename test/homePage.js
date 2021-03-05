const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();

chai.use(chaiHttp);

describe('/GET "make sure test is working"', () => {
  it('test the / route and testing is working', (done) => {
    chai.request(server)
      .get('/')
      .end((e, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.msg.should.equal('hi!');
        done();
      });
  });
});