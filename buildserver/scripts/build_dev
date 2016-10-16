#!/bin/sh
# MAKE SURE TO CHMOD 0755 THESE SO SERVER CAN EXECUTE THEM
# build script to run branch dev
# ian drosos

echo "Running build script.\n"

# checkout branch
# http://stackoverflow.com/questions/1386291/git-git-dir-not-working-as-expected
git -C "/home/ubuntu/markdown-js" checkout "dev"
git -C "/home/ubuntu/markdown-js" pull
echo "Pulled latest code.\n"

# clean build
rm -rf "/home/ubuntu/markdown-js/node_modules"
rm -rf "/home/ubuntu/markdown-js/etc"
echo "Cleaned working directory."

# build
echo "Starting build."
npm cache -f clean && npm --prefix /home/ubuntu/markdown-js install --save /home/ubuntu/markdown-js
npm --prefix /home/ubuntu/markdown-js install --save json-loader
