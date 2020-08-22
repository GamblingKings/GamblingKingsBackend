#!/bin/bash

lsof -ti tcp:8000 | xargs kill
