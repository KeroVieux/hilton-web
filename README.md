# hilton-web


## Init the project
### Set up the .env
```sh
vi .env
```
It should include keys like below:
```
VITE_LB_BASE_URL=http://host:port
```
### Install node_modules
```sh
npm install
```

## Compile and Hot-Reload for Development

```sh
npm run dev
```

## Compile and Minify for Production

```sh
npm run build
```
## Deploy the project in a Docker approach.
Login your server, and clone the project from github
```sh
ssh user@host
git clone ***
```

To build a docker image
```sh
npm run docker:build
```
To run a container
```sh
npm run docker:run
```
To see the container status
```sh
docker ps
```
Open http://127.0.0.1:8080 in your browser.
