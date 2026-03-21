pipeline {
    agent any
    stages {
        stage('Clone') {
              steps{

                       git url: "${REPO_URL}", branch:"${BRANCH}"

                    }
        }
    }
}
