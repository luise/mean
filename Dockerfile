FROM node:6.8

ENV GOPATH="$HOME/gowork"

COPY start.go /

RUN apt-get -y update \
&& apt-get install -y golang-go \
&& go get gopkg.in/mgo.v2 \
&& go build /start.go

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN git clone https://github.com/tejasmanohar/node-todo.git .

RUN apt-get remove --purge -y golang-go $(apt-mark showauto) \
&& rm -rf $GOPATH \
&& rm -rf /var/lib/apt/lists/*

RUN npm install

CMD ["/start"]
