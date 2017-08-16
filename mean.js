const { createDeployment, Machine, Range, githubKeys, publicInternet }
  = require('@quilt/quilt');
const haproxy = require('@quilt/haproxy');
const Mongo = require('@quilt/mongo');
const Node = require('@quilt/nodejs');

// AWS
const namespace = createDeployment();

const baseMachine = new Machine({
  provider: 'Amazon',
  cpu: new Range(1),
  ram: new Range(2),
  sshKeys: githubKeys('ejj'),
});
namespace.deploy(baseMachine.asMaster());
namespace.deploy(baseMachine.asWorker().replicate(3));

const mongo = new Mongo(3);
const app = new Node({
  nWorker: 3,
  repo: 'https://github.com/quilt/node-todo.git',
  env: {
    PORT: '80',
    MONGO_URI: mongo.uri('mean-example'),
  },
});

const proxy = haproxy.simpleLoadBalancer(app.cluster);

mongo.allowFrom(app.cluster, mongo.port);
proxy.allowFrom(publicInternet, haproxy.exposedPort);

namespace.deploy([app, mongo, proxy]);
