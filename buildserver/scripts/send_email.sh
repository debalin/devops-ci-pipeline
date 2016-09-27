echo "Mail Script"
IFS=''
while read line
do
echo $line
cat buildStatus.txt | mail -s "Sending the status of the build"  $line  
done < EmailIDs