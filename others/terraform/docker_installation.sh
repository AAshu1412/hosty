#!/bin/bash

sudo apt-get update
sudo apt-get upgrade -y

sudo apt-get install docker.io -y
sudo usermod -aG docker ubuntu


curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs

sudo systemctl enable docker
sudo systemctl start docker