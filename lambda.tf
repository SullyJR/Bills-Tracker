# Lambda function
resource "aws_lambda_function" "bill_reminder" {
  filename         = "lambda/LambdaCode.zip"
  function_name    = "BillReminderFunction"
  role             = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/LabRole"
  handler          = "index.handler"
  source_code_hash = filebase64sha256("lambda/LambdaCode.zip")
  runtime          = "nodejs20.x"
  timeout          = 60
  memory_size      = 128

  environment {
    variables = {
      DB_HOST     = aws_db_instance.mysql.address
      DB_USER     = aws_db_instance.mysql.username
      DB_PASSWORD = aws_db_instance.mysql.password
      DB_NAME     = aws_db_instance.mysql.db_name
    }
  }
}

# Allow Lambda to access RDS
resource "aws_lambda_function_event_invoke_config" "example" {
  function_name = aws_lambda_function.bill_reminder.function_name

  destination_config {
    on_failure {
      destination = aws_sns_topic.lambda_failure.arn
    }

    on_success {
      destination = aws_sns_topic.lambda_success.arn
    }
  }
}

# SNS topics for Lambda success and failure notifications
resource "aws_sns_topic" "lambda_success" {
  name = "lambda-success-topic"
}

resource "aws_sns_topic" "lambda_failure" {
  name = "lambda-failure-topic"
}

# Get current AWS account ID
data "aws_caller_identity" "current" {}

# Lambda permission to allow CloudWatch to invoke the function
resource "aws_lambda_permission" "allow_cloudwatch" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.bill_reminder.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily_trigger.arn
}

# CloudWatch Event Rule to trigger Lambda daily
resource "aws_cloudwatch_event_rule" "daily_trigger" {
  name                = "daily-lambda-trigger"
  description         = "Triggers Lambda function daily"
  schedule_expression = "cron(0 12 * * ? *)"  # Runs daily at 12:00 PM UTC
}

# CloudWatch Event Target linking the rule to the Lambda function
resource "aws_cloudwatch_event_target" "lambda_target" {
  rule      = aws_cloudwatch_event_rule.daily_trigger.name
  target_id = "TriggerLambda"
  arn       = aws_lambda_function.bill_reminder.arn
}