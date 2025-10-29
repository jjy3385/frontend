#!/bin/bash

echo "Stopping Node.js server (pm2)..."

# pm2로 실행된 'react-app'이라는 이름의 프로세스를 중지하고 삭제합니다.

# (중요) '|| true'를 끝에 붙여줍니다.
# 첫 배포 시에는 중지할 서버(react-app)가 없으므로 pm2가 오류를 냅니다.
# '|| true'는 pm2 명령이 실패하더라도 CodeDeploy 배포가 
# 실패하지 않도록 보장해주는 필수 장치입니다.
pm2 stop react-app || true
pm2 delete react-app || true

echo "Life Cycle - ApplicationStop: Server stop command executed."
