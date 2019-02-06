package main

import (
	"encoding/json"
	"errors"
	"flag"
	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
	"time"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"

	"github.com/asm-jaime/gen"
	"github.com/gin-gonic/contrib/sessions"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
)

// ========== constants
const (
	msgGetUserSuccess      = "Get user successfully complete"
	msgUnauthorizedRequest = "Request do not authorized, please login"
	msgAlreadyLoggedIn     = "User already logged in"
	msgLoggedOut           = "Successfully logged out"
	msgLoggedOutNoSession  = "this user don not have session for logged out"
	msgAuthSuccess         = "Auth user succefflully complete"
	msgSaveUserError       = "Can not save user. Please try again"
	msgGetUserError        = "Can not get user without email"
	msgWrongSessionState   = "Wrong session state. Please try login again"
	msgNoRoute             = "Route not found"
)

// ========== server config

type TCred struct {
	Cid     string `json:"cid"`
	Csecret string `json:"csecret"`
}

type Server struct {
	MaxPostChars int
	DefaultLimit int
	MaxLimits    int
	Host         string
	Port         string
	StaticFolder string
	Cred         TCred
}

func (config *Server) SetDefault() {
	config.MaxPostChars = 1000

	config.DefaultLimit = 10
	config.MaxLimits = 1000

	config.Host = "localhost"
	config.Port = "8081"
	config.StaticFolder = "public"

	config.Cred.Cid = "295529031882-ap6njd8e8p0bmggmvkb7t0iflhcetjn1.apps.googleusercontent.com"
	config.Cred.Csecret = "ICiVhKO51UxbNfIQVR7WudxH"
}

// ========== mongo config

type MongoDB struct {
	Host             string
	Port             string
	Addrs            string
	Database         string
	Username         string
	Password         string
	EventTTLAfterEnd time.Duration
	StdEventTTL      time.Duration
	Info             *mgo.DialInfo
	Session          *mgo.Session
}

func (mongo *MongoDB) SetDefault(name string) {
	// host database params
	mongo.Port = "27017"
	mongo.Host = "localhost"
	mongo.Addrs = mongo.Host + ":" + mongo.Port
	// database
	if name == "" {
		name = "oauth2"
	}
	mongo.Database = name
	// user for requests
	mongo.Username = "jaime"
	mongo.Password = "123456789"

	// time live events
	mongo.EventTTLAfterEnd = 1 * time.Second
	mongo.StdEventTTL = 20 * time.Minute
	mongo.Info = &mgo.DialInfo{
		Addrs:    []string{mongo.Addrs},
		Timeout:  10 * time.Second,
		Database: mongo.Database,
		Username: mongo.Username,
		Password: mongo.Password,
	}
	err := mongo.SetSession()
	if err != nil {
		panic("db does not allow")
	}
}

func (mongo *MongoDB) SetSession() (err error) {
	mongo.Session, err = mgo.DialWithInfo(mongo.Info)
	if err != nil {
		mongo.Session, err = mgo.Dial(mongo.Host)
	}
	return err
}

func (mongo *MongoDB) UpsertDefaultUser() (err error) {
	session := mongo.Session.Clone()
	defer session.Close()

	user := &mgo.User{
		Username: mongo.Username,
		Password: mongo.Password,
		Roles:    []mgo.Role{},
	}
	err = session.DB(mongo.Database).UpsertUser(user)
	if err != nil {
		return err
	}
	return nil
}

func (mongo *MongoDB) Drop() (err error) {
	session := mongo.Session.Clone()
	defer session.Close()
	err = session.DB(mongo.Database).DropDatabase()
	return err
}

func (mongo *MongoDB) Init() (err error) {
	err = mongo.Drop()
	if err != nil {
		// if database does not exist, we can ignore this error
		log.Fatal(err)
	}

	err = mongo.UpsertDefaultUser()
	if err != nil {
		return err
	}

	session := mongo.Session.Clone()
	defer session.Close()
	session.EnsureSafe(&mgo.Safe{})

	// ========== users
	collection := session.DB(mongo.Database).C("Users")
	index := mgo.Index{
		Key:        []string{"name"},
		Unique:     false,
		Background: true,
		Sparse:     true,
	}
	err = collection.EnsureIndex(index)
	if err != nil {
		return err
	}
	index = mgo.Index{
		Key:        []string{"email"},
		Unique:     true,
		Background: true,
		Sparse:     true,
	}
	err = collection.EnsureIndex(index)
	if err != nil {
		return err
	}
	return err
}

// ========== model user

type User struct {
	Id    bson.ObjectId `form:"_id" bson:"_id,omitempty"`
	Name  string        `form:"name" binding:"required" bson:"name"`
	Email string        `form:"email" binding:"required" bson:"email"`
}

func (mongo *MongoDB) GetUser(user User) (guser User, err error) {
	session := mongo.Session.Clone()
	defer session.Close()

	if user.Email != "" {
		err = session.DB(mongo.Database).C("Users").Find(
			bson.M{"email": user.Email}).One(&guser)
	} else {
		err = errors.New(msgGetUserError)
	}
	return guser, err
}

func (mongo *MongoDB) PostUser(user User) (err error) {
	session := mongo.Session.Clone()
	defer session.Close()

	err = session.DB(mongo.Database).C("Users").Insert(&user)
	return err
}

// ========== model auth

type (
	ReqAuth struct {
		State string `form:"state" json:"state,omitempty"`
		Code  string `form:"code" json:"code,omitempty"`
	}
)

// ========== handlers

func AuthHandler(c *gin.Context) {
	mongo := c.Keys["mongo"].(*MongoDB)
	coauth := c.Keys["oauth"].(*oauth2.Config)

	session := sessions.Default(c)
	state := session.Get("state")

	var req ReqAuth
	err := c.Bind(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest,
			gin.H{"msg": err.Error(), "body": nil})
		return
	}

	if state != req.State {
		c.JSON(http.StatusBadRequest,
			gin.H{"msg": msgWrongSessionState, "body": nil})
		return
	}

	code := req.Code
	token, err := coauth.Exchange(oauth2.NoContext, code)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest,
			gin.H{"msg": err.Error(), "body": nil})
		return
	}

	client := coauth.Client(oauth2.NoContext, token)
	userinfo, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest,
			gin.H{"msg": err.Error(), "body": nil})
		return
	}

	defer userinfo.Body.Close()
	data, _ := ioutil.ReadAll(userinfo.Body)
	user := User{}
	if err = json.Unmarshal(data, &user); err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest,
			gin.H{"msg": err.Error(), "body": nil})
		return
	}

	err = mongo.PostUser(user)
	// if it's a duplicate, here not a big problem
	if err != nil {
		log.Println(err)
	}

	guser, err := mongo.GetUser(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError,
			gin.H{"msg": err.Error(), "body": nil})
		return
	}

	session.Set("user-id", user.Email)
	err = session.Save()
	if err != nil {
		c.JSON(http.StatusBadRequest,
			gin.H{"msg": err.Error(), "body": nil})
		return
	}

	c.JSON(http.StatusOK,
		gin.H{"msg": msgAuthSuccess, "body": guser})
}

func LoginHandler(c *gin.Context) {
	oauth := c.Keys["oauth"].(*oauth2.Config)
	session := sessions.Default(c)

	email := session.Get("user-id")
	if email != nil {
		c.JSON(http.StatusConflict,
			gin.H{"msg": msgAlreadyLoggedIn, "body": email})
		return
	}

	state := gen.TokenB64(32)
	session.Set("state", state)
	session.Save()

	link := oauth.AuthCodeURL(state)
	c.JSON(http.StatusOK, gin.H{
		"auth_url":     oauth.Endpoint.AuthURL,
		"client_id":    oauth.ClientID,
		"redirect_uri": oauth.RedirectURL,
		"scope":        oauth.Scopes[0],
		"state":        state,
		"link":         link,
	})
}

func LogoutHandler(c *gin.Context) {
	session := sessions.Default(c)
	user := session.Get("user-id")
	if user == nil {
		c.JSON(http.StatusBadRequest,
			gin.H{"msg": msgLoggedOutNoSession, "body": nil})
	} else {
		session.Delete("user-id")
		session.Save()
		c.JSON(http.StatusOK,
			gin.H{"msg": msgLoggedOut, "body": nil})
	}
}

func GetUserHandler(c *gin.Context) {
	mongo := c.Keys["mongo"].(*MongoDB)
	session := sessions.Default(c)

	u := User{}
	u.Email = session.Get("user-id").(string)

	user, err := mongo.GetUser(u)
	if err != nil {
		c.JSON(http.StatusInternalServerError,
			gin.H{"msg": err.Error(), "body": nil})
	} else {
		c.JSON(http.StatusOK,
			gin.H{"msg": msgGetUserSuccess, "body": user})
	}
}

// ========== middlewares

func MiddleDB(mongo *MongoDB, oauth *oauth2.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		err := mongo.Session.Ping()
		if err != nil {
			c.Abort()
		} else {
			c.Set("mongo", mongo)
			c.Set("oauth", oauth)
			c.Next()
		}
	}
}

func MiddleAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		session := sessions.Default(c)
		v := session.Get("user-id")
		if v == nil {
			c.JSON(http.StatusUnauthorized,
				gin.H{"msg": msgUnauthorizedRequest, "body": nil})
			c.Abort()
		}
		c.Next()
	}
}

func MiddleCORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		// c.Writer.Header().Set("Access-Control-Max-Age", "86400")
		if origin := c.Request.Header.Get("Origin"); origin != "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
			c.Writer.Header().Set("Access-Control-Allow-Headers",
				"Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		}

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(200)
		} else {
			c.Next()
		}
	}
}

func MiddleNoRoute(c *gin.Context) {
	path := strings.Split(c.Request.URL.Path, "/")
	if (path[1] != "") && (path[1] == "api") {
		c.JSON(http.StatusNotFound, gin.H{"msg": msgNoRoute, "body": nil})
	} else {
		c.HTML(http.StatusOK, "index.html", "")
	}
}

// ========== init server

func NewRouter(mongo *MongoDB, oauth *oauth2.Config,
	config *Server) *gin.Engine {
	router := gin.Default()

	// support sessions
	store := sessions.NewCookieStore([]byte(gen.TokenB64(64)))
	store.Options(sessions.Options{Path: "/", MaxAge: 86400 * 7})

	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(sessions.Sessions("goquestsession", store))

	router.Use(MiddleCORS())
	router.Use(MiddleDB(mongo, oauth))

	router.LoadHTMLGlob(config.StaticFolder + "/index.html")
	router.Use(static.Serve("/", static.LocalFile(config.StaticFolder, false)))

	api := router.Group("api")
	{
		api.GET("/auth", AuthHandler)
		api.GET("/login", LoginHandler)
		api.GET("/logout", LogoutHandler)

		authorized := api.Group("authorized")
		authorized.Use(MiddleAuth())
		{
			user := authorized.Group("user")
			{
				user.GET("", GetUserHandler)
			}
		}
	}

	router.NoRoute(MiddleNoRoute)
	return router
}

func Start(fls *flags) {
	config := Server{}
	config.SetDefault()
	config.Host = *fls.host
	config.Port = *fls.port
	config.StaticFolder = *fls.folder

	mongo := MongoDB{}
	mongo.SetDefault("")

	coauth := oauth2.Config{
		ClientID:     config.Cred.Cid,
		ClientSecret: config.Cred.Csecret,
		RedirectURL:  "http://" + config.Host + ":" + config.Port + "/api/auth",
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
		},
		Endpoint: google.Endpoint,
	}

	// info
	log.Printf("\nstart on host: %s, port: %s, floder: %s\n",
		config.Host, config.Port, config.StaticFolder)

	// star server
	router := NewRouter(&mongo, &coauth, &config)
	router.Run(":" + config.Port)
}

type flags struct {
	start  *string
	host   *string
	port   *string
	folder *string
}

func main() {
	fls := flags{}
	fls.start = flag.String("start", "oauth2", "start the service")
	fls.host = flag.String("host", "localhost", "service host")
	fls.port = flag.String("port", "8081", "service port")
	fls.folder = flag.String("folder", "./public", "path to index.html folder")
	flag.Parse()

	switch *fls.start {
	case "oauth2":
		Start(&fls)
	case "init":
		err := InitDB()
		if err != nil {
			log.Fatal(err)
		} else {
			log.Println("==========\ninit db successful complete")
		}
	default:
		log.Println("==========\ncan not recognize type of service")
	}
}

func InitDB() (err error) {
	mongo := MongoDB{}
	mongo.SetDefault("")
	defer mongo.Session.Close()

	err = mongo.Drop()
	if err != nil {
		return err
	}

	err = mongo.Init()

	return err
}
