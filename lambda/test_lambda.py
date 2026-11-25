
from lambda_function import lambda_handler


# Simulate an AWS Lambda event
event = {
    "httpMethod": "GET"
}

# Context is not needed for this basic test
context = None

response = lambda_handler(event, context)

print("\nLambda Response:")
print(response)
