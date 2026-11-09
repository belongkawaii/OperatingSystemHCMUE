docker compose -p winnux -f compose.yaml pull server
docker compose -p winnux -f compose.yaml up -d \
    --no-build \
    --wait \
    --wait-timeout 90 
    server

curl -fsS http://localhost:8080/index.html
curl -fsS http://localhost:8080/version.json