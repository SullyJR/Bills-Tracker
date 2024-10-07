resource "aws_lambda_function" "db_cleanup" {
  filename         = "../lambda/LambdaCode.zip"
  function_name    = "DbCleanupFunction"
  role             = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/LabRole"
  handler          = "index.handler"
  source_code_hash = filebase64sha256("../lambda/LambdaCode.zip")
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

# CloudWatch Event Rule to trigger Lambda monthly
resource "aws_cloudwatch_event_rule" "monthly_cleanup" {
  name                = "monthly-db-cleanup"
  description         = "Triggers Lambda function monthly for database cleanup"
  schedule_expression = "rate(30 days)"
}

# CloudWatch Event Target linking the rule to the Lambda function
resource "aws_cloudwatch_event_target" "cleanup_lambda_target" {
  rule      = aws_cloudwatch_event_rule.monthly_cleanup.name
  target_id = "TriggerDbCleanup"
  arn       = aws_lambda_function.db_cleanup.arn
}

#get id of the current account
data "aws_caller_identity" "current" {}

# Lambda permission to allow CloudWatch to invoke the function
resource "aws_lambda_permission" "allow_cloudwatch_cleanup" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.db_cleanup.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.monthly_cleanup.arn
}