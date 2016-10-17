#!/bin/sh
# MAKE SURE TO CHMOD 0755 THESE SO SERVER CAN EXECUTE THEM
# build script to reject commit and pull working commit
# ian drosos

echo "Reverted project and pushing revert....\n"
git revert --no-edit HEAD
git push
