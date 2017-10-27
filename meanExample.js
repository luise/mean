const kelda = require('kelda');
const Mean = require('./mean.js');

// Replication to use for the node application
// and Mongo.
const count = 2;

const machine = new kelda.Machine({
  provider: 'Amazon',
  cpu: new kelda.Range(1),
  ram: new kelda.Range(2),
});

const infra = new kelda.Infrastructure(machine, machine.replicate(count));

const nodeRepository = 'https://github.com/kelda/node-todo.git';
const mean = new Mean(count, nodeRepository);
mean.deploy(infra);
