TAG=latest
PROJECT=neosign

test:
	echo "Add some tests!"

build:
	docker build -t neosign/api:$(TAG) -f docker/Dockerfile .
	
run:
	docker-compose -f docker-compose.yml --project-name $(PROJECT) up -d

down:
	docker-compose -f docker-compose.yml --project-name $(PROJECT) down

create-db:
	docker exec -i $(PROJECT)_mysql_1 mysql -uroot -proot < ./db/initial.sql
	docker exec -i $(PROJECT)_api_1 npm run prepare:db

run-migrations:
	docker exec -i $(PROJECT)_api_1 npm run migrations

new-migration:
	docker exec -it $(PROJECT)_api_1 npm run new-migration $(name)