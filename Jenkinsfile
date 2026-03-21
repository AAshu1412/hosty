pipeline {
    agent any
    
    stages {
        stage('Clone') {
            steps {
                script {
                    env.FOLDER_NAME = env.REPO_URL.tokenize('/').last().minus('.git')
                    
                    dir(env.FOLDER_NAME) {
                        git url: "${env.REPO_URL}", branch: "${env.BRANCH}"
                    }
                }
            }
        }
        
        stage('Install Modules & Build') {
            steps {
                dir(env.FOLDER_NAME) {
                    
                    nodejs(nodeJSInstallationName: '24.9.0') {
                        
                        sh '''
                            npm install -g pnpm
                            pnpm install 
                            pnpm run build
                        '''
                        
                    }
                }
            }
        }

        
    }
}