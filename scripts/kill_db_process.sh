#!/bin/bash

DB_PORT=8000
pid=$(lsof -i:$DB_PORT -t); kill -TERM $pid || kill -KILL $pid
