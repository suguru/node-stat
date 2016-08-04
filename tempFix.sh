#!/bin/bash
#Temporary fix for deal with win-bash and node libraries.
#feo. 
#A facundo le gusta esto.

currentPath="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cp='cp -f'


ifFileChangesThenCopy ()
{
  ### Set initial time of file
  LTIME=`stat -c %Z /proc/$1`
  
  while true    
  do
  	ATIME=`stat -c %Z /proc/$1`
  
  	if [[ "$ATIME" != "$LTIME" ]]
  	then    
                #Update Files.
		$cp /proc/$1 $currentPath/plugins/win32/$1
  		LTIME=$ATIME
  	fi
  	sleep 2
  done
}
  $cp /proc/stat $currentPath/plugins/win32/stat
  ifFileChangesThenCopy stat &
  $cp /proc/meminfo $currentPath/plugins/win32/meminfo
  ifFileChangesThenCopy meminfo &

unset ifFileChangesThenCopy
