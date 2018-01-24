const haproxy = require('@kelda/haproxy');
const Mongo = require('@kelda/mongo');
const Node = require('@kelda/nodejs');
const { publicInternet, allowTraffic } = require('kelda');

function Mean(count, nodeRepo) {
  const port = 80;
  this.mongo = new Mongo(count);
  this.app = new Node({
    nWorker: count,
    repo: nodeRepo,
    env: {
      PORT: port.toString(),
      MONGO_URI: this.mongo.uri('mean-example'),
    },
  });

  this.proxy = haproxy.simpleLoadBalancer(this.app.containers);

  this.mongo.allowTrafficFrom(this.app.containers, this.mongo.port);
  allowTraffic(publicInternet, this.proxy, haproxy.exposedPort);

  this.deploy = function deploy(deployment) {
    this.app.deploy(deployment);
    this.mongo.deploy(deployment);
    this.proxy.deploy(deployment);
  };
}

module.exports = Mean;
