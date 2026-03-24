#!/bin/sh
node update.js
git add images/*
git commit -m 'update'
git push
