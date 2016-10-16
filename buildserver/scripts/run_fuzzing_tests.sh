#!/bin/sh
# MAKE SURE TO CHMOD 0755 THESE SO SERVER CAN EXECUTE THEM
# test script to run branch dev
# kunal kapoor

echo "Running fuzzing test script.\n"
npm install /home/ubuntu/markdown-js
node fuzzer.js
