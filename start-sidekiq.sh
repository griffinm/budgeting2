#!/bin/bash

set -e

bundle exec sidekiq -q default -q queue
