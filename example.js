const {createDeployment, Machine, Range, githubKeys, LabelRule} = require("@quilt/quilt");
var HaProxy = require("@quilt/haproxy");
var Mongo = require("@quilt/mongo");
var Node = require("@quilt/nodejs");

// AWS
var namespace = createDeployment({});

var baseMachine = new Machine({
    provider: "Amazon",
    cpu: new Range(1),
    ram: new Range(2),
    sshKeys: githubKeys("ejj"),
});
namespace.deploy(baseMachine.asMaster());
namespace.deploy(baseMachine.asWorker().replicate(3));

var mongo = new Mongo(3);
var app = new Node({
  nWorker: 3,
  repo: "https://github.com/tejasmanohar/node-todo.git",
  env: {
    PORT: "80",
    MONGO_URI: mongo.uri("mean-example")
  }
});
var haproxy = new HaProxy(3, app.services());

// Places all haproxy containers on separate Worker VMs.
// This is just for convenience for the example instructions, as it allows us to
// access the web application by using the IP address of any Worker VM.
haproxy.service.place(new LabelRule(true, haproxy.service));

mongo.connect(mongo.port, app);
app.connect(mongo.port, mongo);
haproxy.public();

namespace.deploy(app);
namespace.deploy(mongo);
namespace.deploy(haproxy);
