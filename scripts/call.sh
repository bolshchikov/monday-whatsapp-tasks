#!/bin/bash	
# echo tests/figtures/$1.json	
curl -X POST -d @data.json -H "Content-Type: application/json"  http://localhost:3000/messages