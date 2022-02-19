docker build -t seng468-console .
docker tag seng468-console:latest 704268466190.dkr.ecr.ca-central-1.amazonaws.com/seng468-console:latest
docker push 704268466190.dkr.ecr.ca-central-1.amazonaws.com/seng468-console:latest