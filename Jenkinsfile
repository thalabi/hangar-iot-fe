pipeline {
    agent any
     tools { 
         jdk 'jdk-17' 
    }
    //environment {
        // Add path nodejs and npm
        //PATH = '/usr/local/node-v16.13.1-linux-x64/bin:${env.PATH}'
    //}
    stages {

        stage ('Initialize') {
            steps {
                echo "Branch is ${BRANCH_NAME} ..."
                sh '''
                echo "PATH = ${PATH}"
                echo "BRANCH_NAME = ${BRANCH_NAME}"
                java -version
                '''
            }
        }

        stage ('Build') {
            steps {
                sh '''
                cd src/environments
                ls -l
                cat *
                NOW=$(date -u +"%F %T")
                echo $NOW
                cat environment.prod.ts
                sed -i -e "s/@buildVersion@/${BRANCH_NAME}/" \
                    -e "s/@buildTimestamp@/${NOW}/" \
                    environment.prod.ts
                cat environment.prod.ts
                ls -l
                cat *
                pwd
                cd ../..
                pwd
                export PATH=/usr/local/node-v16.13.1-linux-x64/bin/:$PATH

                # Install ng cli locally
                # npm install @angular/cli

                npm install && node_modules/.bin/ng build
                #jar -cvf FlightLogClient.jar dist
                '''
            }
		}
		
        stage ('Package') {
			when {
			    not {
			        branch 'master'
			    }
			}
            steps {
                sh '''
                jar -cvf hangar-iot-fe-${BRANCH_NAME}.jar dist
                '''
            }
		}

        stage ('Deploy') {
			when {
			    not {
			        branch 'master'
			    }
			}
			steps {
                sh '''
                REPOSITORY="maven-releases"
                if [[ $BRANCH_NAME == *"SNAPSHOT"* ]]; then
                    REPOSITORY="maven-snapshots"
                fi
                echo "REPOSITORY = ${REPOSITORY}"

                mvn deploy:deploy-file -DgroupId=com.kerneldc -DartifactId=hangar-iot-fe -Dversion=${BRANCH_NAME} -DgeneratePom=true -Dpackaging=jar -DrepositoryId=kerneldc-nexus -Durl=http://localhost:8081/repository/${REPOSITORY} -Dfile=hangar-iot-fe-${BRANCH_NAME}.jar
                '''
            }
        }
    }
}