package main

import (
	"github.com/asm-jaime/gen"
	"gopkg.in/mgo.v2/bson"
	"testing"
)

// ========== extra functions

func FillRnd(mongo *MongoDB, num int) (err error) {
	session := mongo.Session.Clone()
	defer session.Close()
	user := User{}

	for i := 0; i < num; i++ {
		user.Id = bson.NewObjectId()
		user.Name = "jhon " + gen.Str(4)
		user.Email = gen.Str(6) + "@" + gen.Str(4) + "." + gen.Str(2)
		err = session.DB(mongo.Database).C("Users").Insert(&user)
	}

	return err
}

func dbTest() (mongo *MongoDB, err error) {
	mongo = &MongoDB{}
	mongo.SetDefault("test")

	err = mongo.Init()
	if err != nil {
		return mongo, err
	}

	err = FillRnd(mongo, 5)

	return mongo, err
}

// ========== tests

func TestUser(t *testing.T) {
	testdb, err := dbTest()
	if err != nil {
		t.Error("db error:", err)
	}

	// case create and get
	{
		user := User{}
		user.Id = bson.NewObjectId()
		user.Email = "asm.jaime@gmail.com"
		user.Name = "jaime"
		err := testdb.PostUser(user)
		if err != nil {
			t.Errorf("can not create user %v, %v", user, err)
		}
		user2 := User{}
		user2.Email = "asm.jaime@gmail.com"
		user3, err := testdb.GetUser(user2)
		if err != nil {
			t.Errorf("can not get user %v, %v", user2.Email, err)
		}
		if user3.Email != user.Email {
			t.Errorf("error, we got wrong user: %v", user3.Email)
		}
	}
}
