const kelda = require('kelda');
const Mean = require('./mean.js');
const utils = require('./utils.js');

// Replication to use for the node application
// and Mongo.
const count = 2;
const infrastructure = kelda.createDeployment();

const machine = new kelda.Machine({
  provider: 'Amazon',
  cpu: new kelda.Range(1),
  ram: new kelda.Range(2),
});

utils.addSshKey(machine);

infrastructure.deploy(machine.asMaster());
infrastructure.deploy(machine.asWorker().replicate(count));

const nodeRepository = 'https://github.com/kelda/node-todo.git';
const mean = new Mean(count, nodeRepository);
mean.deploy(infrastructure);
