# MEAN Stack for Kelda.js
The MEAN stack (MongoDB, Express, AngularJS, and node.js) is a popular fullstack
JavaScript framework used for web development. Deploying a flexible, multi-node
MEAN stack app can be both time consuming and costly, but Kelda simplifies this
process. Below, we walk through how to deploy your application in the cloud
using Kelda.

If you'd like to learn more about the files in this repository and how they
work, scroll to the [How This Works](#how-this-works) section at the end.

<img src="./images/mean.gif">

## Deploying your MEAN stack app with Kelda
This repository already contains all the code needed for deploying the multi-node
MEAN stack. The current code deploys a todo app, but we want to change it to
deploy our very simple example app, `awesome-restaurant-app`, located in
[github.com/luise/awesome-restaurant-app](https://github.com/luise/awesome-restaurant-app.git).

To do this, we just have to tweak a single line of code in
[`meanExample.js`](./meanExample.js)

### Deploying a MEAN stack in isolation

##### Our app
First, we make sure that our MongoDB connection URI is set to the `MONGO_URI`
environment variable. Note that this is set in our MEAN app code, not the
Kelda.js specs:

```javascript
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);
```

This is already done in the `awesome-restaurant-app`, but you'll need to
do something similar to your own MEAN app before deploying it with Kelda.

For an example, see how [server.js](https://github.com/luise/awesome-restaurant-app/blob/master/server.js#L10)
in the `awesome-restaurant-app` uses the URI in [config/database.js](https://github.com/luise/awesome-restaurant-app/blob/master/config/database.js) to connect to MongoDB.

##### Updating the application code repository
The `Mean` constructor called in [`meanExample.js`](./meanExample.js) takes a
string `repo` which specifies the git repository containing the Node application
to deploy. Let's change this URL to point to our restaurant app:

```javascript
const nodeRepository = "https://github.com/luise/awesome-restaurant-app.git";
```

If you want to change the characteristics of the VMs, go ahead and modify the
relevant properties of the `baseMachine` object in
[`meanExample.js`](./meanExample.js).

##### Deploy
Now we're ready to deploy our MEAN stack application! If you haven't already
set up Kelda and your provider credentials, go ahead and follow [the instructions](http://docs.kelda.io/#installing-kelda)
in our docs.

When you're set up, run `kelda daemon` in one shell, and then run
`kelda run ./meanExample.js` from the `mean` directory in another shell. If
successful, the `kelda run` command has no output, while the daemon will output logs
similar to this:

```
$ kelda daemon
INFO [Feb 17 16:23:59.181] db.Cluster:
	Cluster-1{}
INFO [Feb 17 16:23:59.184] db.Machine:
	Machine-2{c14105b79bb167a088cf1ae8c9169b51deb6b29f, Master, Amazon us-west-1 m4.large, Disk=32GB}
	Machine-3{89d34da8fde90ce26650c0629f22e2c9e48b8f46, Worker, Amazon us-west-1 m4.large, Disk=32GB}
	...
```

You can see the status of the system with the command `kelda show`. The system is
fully booted when the `STATUS`es of all containers are `running`:

```
CONTAINER       MACHINE         COMMAND                                 LABELS      STATUS     CREATED               PUBLIC IP
7101084e12ab    89d34da8fde9    node-app:awesome-restaurant-app.git     app         running    About a minute ago
c8e5464625e0    89d34da8fde9    keldaio/mongo                           mongo       running    About a minute ago

4d3d6be15985    a2077202355d    haproxy:1.6.4                           hap         running    About a minute ago    54.193.9.14:80
...
```

##### Access Web App
We can now access our web app by using the public IP address of the VM hosting
a proxy container. The above output from `kelda show` shows us that we can access
the web app at `54.193.9.14`.

Now, simply go to `http://PROXY_PUBLIC_IP:80` in your browser. As you see, our
app is up!

##### Shut Down VMs
To shut down our application and VMs, run `kelda stop`, and wait for the message
`Successfully halted machines.` in the kelda daemon output.

### Deploying a MEAN stack alongside other services

The description above described how to modify [meanExample.js](./meanExample.js)
to run your own MEAN application.  [meanExample.js](./meanExample.js) created
virtual machines, and used the functionality in [mean.js](./mean.js) to launch a
MEAN stack on those machines.  You may want to incorporate your application
into a larger collection of services that you deploy with Kelda.  To do this,
first import the functionality in [mean.js](./mean.js) by requiring the
`@kelda/mean` npm package:

```javascript
require('@kelda/mean');
```

You'll also need to add a dependency on `@kelda/mean` to `package.json`:

```json
"dependencies": {
  "@kelda/mean": "kelda/mean",
}
```

Then use the `Mean` constructor, as in [meanExample.js](./meanExample.js), to
initialize and deploy a MEAN stack:

```javascript
// Create a Kelda deployment object. This will be used to deploy the MEAN
// stack, and can also be used to deploy other parts of your application
// (e.g., myOtherService.deploy(deployment)).
const deployment = kelda.createDeployment();

// Use 3 Mongo containers and 3 Node application containers.
const count = 3;
const mean = new Mean(count, 'https://github.com/you/your-cool-app.git');

// Add MEAN to the deployment.
mean.deploy(deployment);
```

## How This Works

This repository contains a blueprint to run a MEAN stack application.  The
blueprint is broken into two different files:

- `mean.js`: This file exports a constructor `Mean` that creates a
deployable object that represents a MEAN stack application.  Deploying a
`Mean` instance deploys a replicated Node.js application, an HAProxy
service to load balance over the Node.js application, and a replicated
MongoDB service to use to store the application's data.
These services are deployed by building on other, existing Kelda
blueprints that `mean.js` `require()`s.  Because those existing blueprints
describe how to run each individual service, all `mean.js` needs to do is to
hook the services together (e.g., by opening a connection between MongoDB
and the Node.js application).
- `meanExample.js`: This file initializes a set of Amazon EC2 instances, and
then uses the Mean constructor to deploy the example Node.js application (a
TODO app) on those instances.
While this particular file describes virtual machines on Amazon
EC2, an infrastructure can describe physical or virtual machines
on any cloud provider (Kelda currently supports GCE, AWS, DigitalOcean,
and Vagrant is experimental).

## Next steps

For more information about how Kelda works, and how to use
Kelda to launch other applications, check out our [docs](http://docs.kelda.io).
If you're interested in writing your own blueprints, take a look at our
[Blueprint Writer's Guide](http://docs.kelda.io/#blueprint-writers-guide).

## Feedback

If you run into any hiccups or have feedback about using Kelda, we'd love to
hear from you! Shoot us an email at [dev@kelda.io](mailto:dev@kelda.io).

