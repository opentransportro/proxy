#!/bin/bash
# Set these environment variables
#DOCKER_TAG=
#DOCKER_USER=
#DOCKER_AUTH=

set -o errexit -o nounset -o xtrace

ORG=${ORG:-opentransport}
DOCKER_TAG=${TRAVIS_COMMIT:-latest}
DOCKER_IMAGE=$ORG/proxy:$DOCKER_TAG
LATEST_IMAGE=$ORG/proxy:latest
PROD_IMAGE=$ORG/proxy:prod


if [ "${TRAVIS_PULL_REQUEST}" == "false" ]; then
  docker login -u ${DOCKER_USER} -p ${DOCKER_AUTH}
  if [ "$TRAVIS_TAG" ];then
    echo "processing release $TRAVIS_TAG"
    #release do not rebuild, just tag
    docker pull $DOCKER_IMAGE
    docker tag ${DOCKER_IMAGE} ${PROD_IMAGE}
    docker push ${PROD_IMAGE}
  else
    ./test.sh
    docker build  --tag=$DOCKER_IMAGE -f Dockerfile .
    docker push ${DOCKER_IMAGE}
    echo "processing $TRAVIS_BRANCH build $TRAVIS_COMMIT"
    if [ "$TRAVIS_BRANCH" = "master" ]; then
      docker tag ${DOCKER_IMAGE} ${LATEST_IMAGE}
      docker push ${LATEST_IMAGE}
    else
      docker tag ${DOCKER_IMAGE} $ORG/proxy:$TRAVIS_BRANCH
      docker push $ORG/proxy:$TRAVIS_BRANCH
    fi
  fi
else
  echo "processing pr $TRAVIS_PULL_REQUEST"
  ./test.sh
  docker build  --tag=$DOCKER_IMAGE -f Dockerfile .
fi

echo Build completed