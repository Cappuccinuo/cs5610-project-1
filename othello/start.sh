#!/bin/bash

export PORT=5103

cd ~/www/othello
./bin/othello stop || true
./bin/othello start

