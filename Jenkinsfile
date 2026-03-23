pipeline {
    agent any
    
    stages {
        stage('Clone') {
            steps {
                script {
                    env.FOLDER_NAME = env.REPO_URL.tokenize('/').last().minus('.git').toLowerCase()
                    
                    // 1. SAFE SUB-DIRECTORY LOGIC
                    // We check if a variable named 'SUB_DIR' was provided and isn't empty.
                    if (env.SUB_DIR?.trim()) {
                        // If yes, build path is: folder/subdirectory
                        env.BUILD_DIR = "${env.FOLDER_NAME}/${env.SUB_DIR}"
                    } else {
                        // If no, build path is just the base folder
                        env.BUILD_DIR = env.FOLDER_NAME
                    }
                    
                    // Always clone into the base folder
                    dir(env.FOLDER_NAME) {
                        git url: "${env.REPO_URL}", branch: "${env.BRANCH}"
                    }
                }
            }
        }
        
        stage('Install Modules & Build') {
            steps {
                // 2. USE THE CALCULATED DIRECTORY
                // This cleanly handles both scenarios without syntax errors
                dir(env.BUILD_DIR) {
                    
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

        stage('Apache Virtual Host Configuration') {
            steps {
                sh '''
                    set +x 
                    
                    # Create the web directory safely (always uses the base repo name)
                    mkdir -p /srv/http/$FOLDER_NAME
                    
                    # 3. USE BUILD_DIR FOR THE COPY COMMAND
                    # Because we calculated BUILD_DIR earlier, this line always works perfectly!
                    cp -r /var/lib/jenkins/workspace/Hosty/$BUILD_DIR/dist/* /srv/http/$FOLDER_NAME/
                '''
            }
        }
        
        stage('Configure Apache & Restart') {
            steps {
                sh '''
                    set +x 
                    
                    # --- 1. APACHE VIRTUAL HOST ---
                    VHOST_BLOCK="
<VirtualHost *:80>
    ServerAdmin webmaster@example.com
    DocumentRoot /srv/http/$FOLDER_NAME
    ServerName $FOLDER_NAME.hosty.com
    ServerAlias www.$FOLDER_NAME.hosty.com
    ErrorLog /var/log/httpd/${FOLDER_NAME}_error.log
    CustomLog /var/log/httpd/${FOLDER_NAME}_access.log combined
</VirtualHost>"

                    if ! grep -q "ServerName $FOLDER_NAME.hosty.com" /etc/httpd/conf/extra/httpd-vhosts.conf; then
                        echo "Adding new VirtualHost configuration for $FOLDER_NAME..."
                        echo "$VHOST_BLOCK" | sudo /usr/bin/tee -a /etc/httpd/conf/extra/httpd-vhosts.conf > /dev/null
                    else
                        echo "VirtualHost for $FOLDER_NAME already exists. Skipping append."
                    fi

                    # --- 2. LOCAL DNS ROUTING (/etc/hosts) ---
                    HOSTS_ENTRY="127.0.0.1   $FOLDER_NAME.hosty.com www.$FOLDER_NAME.hosty.com"
                    
                    if ! grep -q "$FOLDER_NAME.hosty.com" /etc/hosts; then
                        echo "Adding local DNS routing to /etc/hosts..."
                        echo "$HOSTS_ENTRY" | sudo /usr/bin/tee -a /etc/hosts > /dev/null
                    else
                        echo "DNS routing for $FOLDER_NAME already exists in /etc/hosts. Skipping."
                    fi

                    # --- 3. TEST AND RESTART ---
                    sudo /usr/bin/httpd -t
                    sudo /usr/bin/systemctl restart httpd
                '''
            }
        }
    }
}