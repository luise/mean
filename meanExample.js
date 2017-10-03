const quilt = require('@quilt/quilt');
const Mean = require('./mean.js');
const utils = require('./utils.js');

// Replication to use for the node application
// and Mongo.
const count = 2;
const infrastructure = quilt.createDeployment();

const machine = new quilt.Machine({
  provider: 'Amazon',
  cpu: new quilt.Range(1),
  ram: new quilt.Range(2),
});

utils.addSshKey(machine);

infrastructure.deploy(machine.asMaster());
infrastructure.deploy(machine.asWorker().replicate(count));

const nodeRepository = 'https://github.com/quilt/node-todo.git';
const mean = new Mean(count, nodeRepository);
mean.deploy(infrastructure);
