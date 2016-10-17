#!/bin/sh

echo "Running mail script."

IFS=''

while read line
do
echo "Sending mail to " $line
if ($3 eq "true") then
	subject='markdown-js '$2': build successful'
else
	subject='markdown-js '$2': build failed'
fi
if ($4 eq "true") then
	subject=$subject' + tests passed'
else
	subject=$subject' + tests failed'
fi
cat $1 | mail -s $subject $line  
done < ./scripts/email_ids
