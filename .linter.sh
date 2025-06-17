#!/bin/bash
cd /home/kavia/workspace/code-generation/gridburst-puzzle-59538-38e52930/gridburst_puzzle_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

