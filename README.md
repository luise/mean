# MEAN Stack for Quilt.js
The MEAN stack (MongoDB, Express, AngularJS, and node.js) is a popular fullstack
JavaScript framework used for web development. Deploying a flexible, multi-node
MEAN stack app can be both time consuming and costly, but Quilt simplifies this
process. Below, we walk through how to deploy your application in the cloud
using Quilt.

<img src="./images/mean.gif">

## Deploying your MEAN stack app with Quilt
This repository already contains all the code needed for deploying the multi-node
MEAN stack. The current code deploys a todo app, but we want to change it to
deploy our very simple example app, `awesome-restaurant-app`, located in
[github.com/LuiseV/awesome-restaurant-app](https://github.com/LuiseV/awesome-restaurant-app.git).

To do this, we just have to tweak a few lines of code in the following files:

* [`Dockerfile`](./Dockerfile) (1 line)
* [`Makefile`](./Makefile) (1 line)
* [`example.js`](./example.js) (2 lines)

### How to

##### Our app
First, we make sure that our MongoDB connection URI is set to the `MONGO_URI`
environment variable. Note that this is set in our MEAN app code, not the
Quilt.js specs:

```javascript
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);
```

This is already done in the `awesome-restaurant-app`, but you'll need to
do something similar to your own MEAN app before deploying it with Quilt.

For an example, see how [server.js](https://github.com/LuiseV/awesome-restaurant-app/blob/master/server.js#L10)
in the `awesome-restaurant-app` uses the URI in [config/database.js](https://github.com/LuiseV/awesome-restaurant-app/blob/master/config/database.js) to connect to MongoDB.

##### Dockerfile
In [`Dockerfile`](./Dockerfile), we change the `git clone`
command to clone the GitHub repository that contains our app.

```
RUN git clone https://github.com/LuiseV/awesome-restaurant-app.git .
```

This says that we want the application containers to host the source code
for the `awesome-restaurant-app` rather than the todo app.

##### Makefile
The current [`Makefile`](./Makefile) points to Quilt's Dockerhub
repository. Let's change that, so it points to the container registry
repository (e.g. on [Docker Hub](https://hub.docker.com/)), that contains
our image.

```
REPO = luise/mean-service
```

This way we will push and pull our application image to/from our personal
repository in the next step.

##### Build and Push Image
In a shell, run `make push-image` from within this repository. This command
will build an image from the Dockerfile we just modified, and push the resulting
image to our image registry repository.

```
$ make push-image
The push refers to a repository [docker.io/luise/mean-service]
...
```

This will take a few minutes.

The above step requires that Docker is installed and running, and that we're
authenticated - e.g. by using `docker login` for DockerHub. Check out
[Docker's website](https://docs.docker.com/engine/installation/) for more.

##### example.js
The `Node` constructor called in [`example.js`](./example.js) takes a string
`image` which specifies the location of a container image. The Node.js
application containers will be created from this image, so let's have it point
to the image we just created:

```javascript
var app = new Node({
  ...
  image: "luise/mean-service",
  ...
});
```

Finally, before we deploy our MEAN stack, let's set the `sshKeys` property to
be our GitHub username instead of `ejj`. This way we can ssh into the VMs in
our deployment using any ssh key associated with our GitHub profile.

```javascript
var baseMachine = new Machine({
    ...
    sshKeys: githubKeys("ejj"),
});
```

If you want to change the characteristics of the VMs, go ahead and modify the
relevant properties of the `baseMachine` object.

##### Deploy
Now we're ready to deploy our MEAN stack application! If you haven't already
worked through [Quilt's Getting Started guide](https://github.com/NetSys/quilt/blob/master/docs/GettingStarted.md)
guide, now is a good time to check it out and set up your `GOPATH` and
`QUILT_PATH`, and `quilt get` the Quilt specs.

When you're set up, run `quilt daemon` in one shell, and then run
`quilt run github.com/quilt/mean/example.js` in another shell. If successful,
the `quilt run` command has no output, while the daemon will output logs
similar to this:

```
$ quilt daemon
INFO [Feb 17 16:23:59.181] db.Cluster:
	Cluster-1{}
INFO [Feb 17 16:23:59.184] db.Machine:
	Machine-2{c14105b79bb167a088cf1ae8c9169b51deb6b29f, Master, Amazon us-west-1 m4.large, Disk=32GB}
	Machine-3{89d34da8fde90ce26650c0629f22e2c9e48b8f46, Worker, Amazon us-west-1 m4.large, Disk=32GB}
	...
```

You can see the status of the system with the command `quilt ps`. The system is
fully booted when the `STATUS`es of all containers are `running`:

```
CONTAINER       MACHINE         COMMAND                LABELS      STATUS     CREATED               PUBLIC IP
7101084e12ab    89d34da8fde9    luise/mean-service     app         running    About a minute ago
957596e1beed    89d34da8fde9    quilt/haproxy          hap         running    About a minute ago    54.241.174.139:80
c8e5464625e0    89d34da8fde9    quilt/mongo            mongo       running    About a minute ago

4d3d6be15985    a2077202355d    quilt/haproxy          hap         running    About a minute ago    54.193.9.14:80
...
```

##### Access Web App
We can now access our web app by using the public IP address of any of our VMs
that are hosting a proxy container. The above output from `quilt ps` shows us
that we can access the web app at `54.241.174.139` and `54.193.9.14`.

Now, simply go to `http://PROXY_PUBLIC_IP:80` in your browser. As you see, our
app is up!

##### Shut Down VMs
To shut down our application and VMs, run `quilt stop`, and wait for the message
`Successfully halted machines.` in the quilt daemon output.

### More Info
See [Quilt](http://quilt.io) for more information.

