const rewire = require("rewire")
const main = rewire("./main")
const getPopupDimensions = main.__get__("getPopupDimensions")
const openPopup = main.__get__("openPopup")
const getExpiresAt = main.__get__("getExpiresAt")
const hasToken = main.__get__("hasToken")
const getToken = main.__get__("getToken")
const setToken = main.__get__("setToken")
const removeToken = main.__get__("removeToken")
const listenForCredentials = main.__get__("listenForCredentials")
const authorize = main.__get__("authorize")
const loginSuccess = main.__get__("loginSuccess")
const loginFailure = main.__get__("loginFailure")
const logout = main.__get__("logout")
const requestGet = main.__get__("requestGet")
const get_user = main.__get__("get_user")
const login = main.__get__("login")
const Login = main.__get__("Login")
const mapStateToProps = main.__get__("mapStateToProps")
const mapDispatchToProps = main.__get__("mapDispatchToProps")
const authMiddleware = main.__get__("authMiddleware")
const configureStore = main.__get__("configureStore")
// @ponicode
describe("getPopupDimensions", () => {
    test("0", () => {
        let callFunction = () => {
            getPopupDimensions(1, 10)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            getPopupDimensions(1, 150)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            getPopupDimensions(10, 432)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            getPopupDimensions(-10, 150)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            getPopupDimensions(0.5, 390)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            getPopupDimensions(-Infinity, -Infinity)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("openPopup", () => {
    test("0", () => {
        let callFunction = () => {
            openPopup("http://base.com", "Michael", 64, 24000)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            openPopup("http://www.croplands.org/account/confirm?t=", "Michael", 100, 255)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            openPopup("https://", "Anas", 800, 390)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            openPopup("ponicode.com", "Edmond", 0, 30)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            openPopup("ponicode.com", "Edmond", 10, 680)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            openPopup("", undefined, Infinity, Infinity)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("getExpiresAt", () => {
    test("0", () => {
        let callFunction = () => {
            getExpiresAt()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("hasToken", () => {
    test("0", () => {
        let callFunction = () => {
            hasToken()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("getToken", () => {
    test("0", () => {
        let callFunction = () => {
            getToken()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("setToken", () => {
    test("0", () => {
        let callFunction = () => {
            setToken(",", "4.0.0-beta1\t")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            setToken("}}", "1.0.0")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            setToken("%a", "4.0.0-beta1\t")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            setToken("==", "v4.0.0-rc.4")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            setToken("'", "v4.0.0-rc.4")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            setToken(undefined, undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("removeToken", () => {
    test("0", () => {
        let callFunction = () => {
            removeToken()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("listenForCredentials", () => {
    test("0", () => {
        let callFunction = () => {
            listenForCredentials({ closed: false, close: () => false }, "Île-de-France", () => "path/to/folder/", "TypeError exception should be raised")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            listenForCredentials({ closed: true, close: () => false }, "Île-de-France", () => ".", "<error_message>%s</error_message>")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            listenForCredentials({ closed: true, close: () => false }, "Île-de-France", () => "path/to/folder/", "Unable to allocate address")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            listenForCredentials({ closed: true, close: () => false }, "Île-de-France", () => "path/to/file.ext", "Sorry, The video you are looking for does not exist.")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            listenForCredentials({ closed: true, close: () => false }, "Florida", () => "./path/to/file", "Unable to allocate address")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            listenForCredentials(undefined, undefined, undefined, undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("authorize", () => {
    test("0", () => {
        let callFunction = () => {
            authorize({ height: 544, client: 10.23, scope: false, width: 255, url: "ponicode.com", state: {} })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            authorize({ height: 10, client: -1.0, scope: false, width: 5, url: "ponicode.com", state: "Abruzzo" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            authorize({ height: 2048, client: 10.23, scope: false, width: 16, url: "http://www.croplands.org/account/confirm?t=", state: {} })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            authorize({ height: 400, client: 10.23, scope: false, width: 120, url: "Www.GooGle.com?", state: "Abruzzo" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            authorize({ height: 20, client: -0.5, scope: false, width: 720, url: "https://api.telegram.org/", state: {} })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            authorize(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("loginSuccess", () => {
    test("0", () => {
        let callFunction = () => {
            loginSuccess("as", 987650)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            loginSuccess("):", "bc23a9d531064583ace8f67dad60f6bb")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            loginSuccess("(", 12345)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            loginSuccess("=", "a1969970175")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            loginSuccess("`", 987650)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            loginSuccess("", NaN)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("loginFailure", () => {
    test("0", () => {
        let callFunction = () => {
            loginFailure("too many arguments")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            loginFailure("invalid choice")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            loginFailure("error")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            loginFailure("ValueError")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            loginFailure("error\n")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            loginFailure(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("logout", () => {
    test("0", () => {
        let callFunction = () => {
            logout()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("requestGet", () => {
    test("0", () => {
        let callFunction = () => {
            requestGet(9876)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            requestGet("c466a48309794261b64a4f02cfcc3d64")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            requestGet("da7588892")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            requestGet(12345)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            requestGet("bc23a9d531064583ace8f67dad60f6bb")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            requestGet(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("get_user", () => {
    test("0", () => {
        let callFunction = () => {
            get_user()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("login", () => {
    test("0", () => {
        let callFunction = () => {
            login()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("clickLogin", () => {
    let object
    let inst

    beforeEach(() => {
        object = [["Michael", "Pierre Edouard", "Pierre Edouard"], ["George", "Michael", "Edmond"], ["Michael", "Michael", "Pierre Edouard"]]
        inst = new Login(object)
    })

    test("0", () => {
        let callFunction = () => {
            inst.clickLogin()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("componentDidMount", () => {
    let object
    let inst

    beforeEach(() => {
        object = [["Edmond", "Anas", "George"], ["Edmond", "Michael", "Michael"], ["Anas", "Anas", "Pierre Edouard"]]
        inst = new Login(object)
    })

    test("0", () => {
        let callFunction = () => {
            inst.componentDidMount()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("mapStateToProps", () => {
    test("0", () => {
        let callFunction = () => {
            mapStateToProps({ auth: { isLoggedIn: false }, reducer: { user: "user123" } })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            mapStateToProps({ auth: { isLoggedIn: true }, reducer: { user: "user123" } })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            mapStateToProps({ auth: { isLoggedIn: false }, reducer: { user: "user name" } })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            mapStateToProps({ auth: { isLoggedIn: true }, reducer: { user: 123 } })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            mapStateToProps({ auth: { isLoggedIn: false }, reducer: { user: 123 } })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            mapStateToProps(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("mapDispatchToProps", () => {
    test("0", () => {
        let callFunction = () => {
            mapDispatchToProps("c466a48309794261b64a4f02cfcc3d64")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            mapDispatchToProps(9876)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            mapDispatchToProps("bc23a9d531064583ace8f67dad60f6bb")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            mapDispatchToProps(12345)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            mapDispatchToProps("da7588892")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            mapDispatchToProps(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("authMiddleware", () => {
    test("0", () => {
        let callFunction = () => {
            authMiddleware(false)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            authMiddleware(true)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            authMiddleware(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("configureStore", () => {
    test("0", () => {
        let callFunction = () => {
            configureStore("Florida")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            configureStore("Abruzzo")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            configureStore("Alabama")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            configureStore("Île-de-France")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            configureStore(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})
