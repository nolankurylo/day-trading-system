This is the server and back-end section of the code. 

To push local server instance to AWS use the following ECRCommands:

  1. Login to AWS:
  aws configure

  2. Login to ECR:
  aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/d7o4k9p4

  3. CD into folder with Dockerfile and build (note add --platform=linux/amd64 before -t if using m1):
  docker build -t public.ecr.aws/d7o4k9p4/seng468-server:latest . 

  4. Locally run the docker container for testing:
  docker run -p 3000:8080 public.ecr.aws/d7o4k9p4/seng468-server:latest   

  5. Push docker image to ECR
  docker push public.ecr.aws/d7o4k9p4/seng468-server:latest 
