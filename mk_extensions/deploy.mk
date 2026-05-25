##@ Deployment

.PHONY: deploy-fly deploy-check deploy-status deploy-logs deploy-safe

deploy-fly: ## Deploy backend to Fly.io
	@$(SCRIPTS_PATH)/deploy/fly.sh

deploy-check: ## Run pre-deployment checks (compile, tests, env)
	@$(SCRIPTS_PATH)/deploy/check.sh

deploy-status: ## Show current Fly.io application status
	@$(SCRIPTS_PATH)/deploy/status.sh

deploy-logs: ## Stream live Fly.io application logs
	@$(SCRIPTS_PATH)/deploy/logs.sh

deploy-safe: deploy-check deploy-fly ## Run pre-checks then deploy to Fly.io
