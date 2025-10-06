@echo off
echo Construyendo imagen Docker...
docker build -t app-luz-sombra .

echo.
echo Ejecutando contenedor...
docker run -p 10000:10000 --name app-luz-sombra-container app-luz-sombra

echo.
echo Para detener el contenedor:
echo docker stop app-luz-sombra-container
echo docker rm app-luz-sombra-container

