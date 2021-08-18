#!/bin/bash
git tag -d v1.1
git push --delete origin v1.1
git add .
git commit -m "Testing commit"
git tag -a v1.1 -m "v1.1"
git push origin v1.1