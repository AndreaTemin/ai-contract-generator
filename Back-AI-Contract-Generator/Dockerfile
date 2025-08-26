# # Use an official AWS Lambda Python runtime as a parent image
# FROM public.ecr.aws/lambda/python:3.11

# # Copy the requirements file into the container
# COPY requirements.txt ./

# # Install the dependencies
# RUN python3.11 -m pip install -r requirements.txt --target "${LAMBDA_TASK_ROOT}"

# # Copy the rest of your application code
# COPY ./app ${LAMBDA_TASK_ROOT}/app
# COPY llm_request_call_2.py ${LAMBDA_TASK_ROOT}/
# Set the command to run your app using a Lambda adapter
# This tells Lambda how to communicate with your FastAPI app
# CMD [ "app.main.handler" ]
# ####################################################################

# Use a standard, lightweight Python image
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /code

# Copy the requirements file
COPY ./requirements.txt /code/requirements.txt

# Install dependencies
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy your application code
COPY ./app /code/app
COPY ./libs/two_steps_tos_generator.py /code/libs/two_steps_tos_generator.py

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

