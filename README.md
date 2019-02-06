# gin-react-oauth2

oauth2 authentication with Gin

#### install

  * `go, node, npm, gulp` and `docker` should be installed

  * `docker run -d -p 27017:27017 -v /data/db:/data/db --name mongo1 mongo`
  * `docker start mongo1`
  * `cd gin-react-oauth2`
  * `go get`
  * `go build`
  * `./gin-react-oauth2 -start=init`
  * `npm install`
  * first console `gulp watch`
  * second console `gulp server` or `go build && ./gin-react-oauth2`

#### test
  * `go test`
