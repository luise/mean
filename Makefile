REPO = quilt/mean-service

all: build-image

build-image:
	docker build -t $(REPO) .

push-image: build-image
	docker push $(REPO)
