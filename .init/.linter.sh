#!/bin/bash
cd /home/kavia/workspace/code-generation/role-based-access-dashboard-304334-304343/backend_api
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

