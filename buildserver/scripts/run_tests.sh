#!/bin/sh
# MAKE SURE TO CHMOD 0755 THESE SO SERVER CAN EXECUTE THEM
# test script to run on required branch
# ian drosos

echo "Running test script.\n"
npm --prefix /home/ubuntu/markdown-js run test -- --cov
