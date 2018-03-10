TAG=latest

test:
	echo "Add some tests!"

build:
	docker build -t gaga_network/portal:$(TAG) -f docker/Dockerfile .

push:
	docker tag gaga_network/portal:$(TAG) 729372504734.dkr.ecr.eu-central-1.amazonaws.com/gaga_network/portal:$(TAG)
	docker push 729372504734.dkr.ecr.eu-central-1.amazonaws.com/gaga_network/portal:$(TAG)