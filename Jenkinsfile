pipeline {
    agent any
    stages {
        stage('Debug') {
            steps {
                echo "All params: ${params}"
                echo "name param: '${name}'"
                echo "name exists: ${params.name != null}"
                echo "Hello World: ${name ?: 'NO PARAM'}"
            }
        }
    }
}
