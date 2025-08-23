# Use an official AWS Lambda Python runtime as a parent image
FROM public.ecr.aws/lambda/python:3.11

# Copy the requirements file into the container
COPY requirements.txt ./

# Install the dependencies
RUN python3.11 -m pip install -r requirements.txt --target "${LAMBDA_TASK_ROOT}"

# Copy the rest of your application code
COPY ./app ${LAMBDA_TASK_ROOT}/app
COPY llm_request_call_2.py ${LAMBDA_TASK_ROOT}/

# Set the command to run your app using a Lambda adapter
# This tells Lambda how to communicate with your FastAPI app
CMD [ "app.main.handler" ]