# ── Colors ──────────────────────────────────────────────────────────────
CYAN   := \033[36m
GREEN  := \033[32m
YELLOW := \033[33m
BOLD   := \033[1m
RESET  := \033[0m

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(CYAN)%-30s$(RESET) %s\n", $$1, $$2}'

install:	## Install Dependencies
	@pnpm i

watch:	## Build for Dev environment and Watch files
	@pnpm watch

lint:	## Lint all files
	@pnpm lint

tests:	## Run all tests (unit + e2e)
	@make test-unit
	@make test-e2e

test-unit:	## Run unit tests (JEST)
	@pnpm test

test-e2e:		## Run e2e tests (Cypress CLI)
	@pnpm test-e2e

test-e2e-gui:	## Run e2e tests (Cypress GUI)
	@pnpm test-e2e-gui

types-test:	## Build and generate a version to test for types
	@rm -f typeahead-standalone-*.tgz
	@make prod
	@pnpm copy-dts-declarations
	@pnpm pack

prod:	## Build for Production environment
	@pnpm prod

deploy-docs:	## Sync docs/ to the static server (nikslab:/srv/static/typeahead-docs/)
	@printf "$(BOLD)$(YELLOW)→ Deploying docs to nikslab...$(RESET)\n"
	@rsync -avz --delete /var/www/html/typeahead-standalone/docs/ nikslab:/srv/static/typeahead-docs/
	@printf "$(BOLD)$(GREEN)✓ Docs deployed.$(RESET)\n"

publish:	## Publish to NPM
	@make prod
	@pnpm copy-dts-declarations
	@make tests
	@pnpm publish
