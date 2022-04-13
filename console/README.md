This is the console application will use loadfiles on the day trading system to test performance. 

To push local console instance to AWS use the following ECRCommands:
  1. Login to AWS:
  aws configure

  2. Login to ECR:
  aws ecr get-login-password --region ca-central-1 | docker login --username AWS --password-stdin 704268466190.dkr.ecr.ca-central-1.amazonaws.com

  3. CD into folder with Dockerfile and build (note add --platform=linux/amd64 before -t if using m1):
  docker build -t seng468-console .
  docker tag seng468-console:latest 704268466190.dkr.ecr.ca-central-1.amazonaws.com/seng468-console:latest

  4. Locally run the docker container for testing:
  docker run -p 9000:8080 704268466190.dkr.ecr.ca-central-1.amazonaws.com/seng468-console:latest   

  5. Push docker image to ECR
  docker push 704268466190.dkr.ecr.ca-central-1.amazonaws.com/seng468-console:latest
