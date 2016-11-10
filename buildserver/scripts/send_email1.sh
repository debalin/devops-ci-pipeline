#!/bin/sh

echo "Running mail script."

IFS=''

while read line
do
echo "Sending mail to " $line
cat $1 | mail -s "Sending Monitoring Email"  $line  
done < ./scripts/email_ids
