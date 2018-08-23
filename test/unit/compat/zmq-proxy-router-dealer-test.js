if (!process.env.NO_COMPAT_TEST) {
  const zmq = require("./load")
  const {assert} = require("chai")
  const {testProtos, uniqAddress} = require("../helpers")

  for (const proto of testProtos("tcp")) {
    describe(`compat proxy with ${proto} router-dealer`, function() {
      const sockets = []

      afterEach(function() {
        while (sockets.length) {
          sockets.pop().close()
        }
      })

      it("should proxy req-rep connected over router-dealer", function(done) {
        const frontendAddr = uniqAddress(proto)
        const backendAddr = uniqAddress(proto)

        const frontend = zmq.socket("router")
        const backend = zmq.socket("dealer")

        const rep = zmq.socket("rep")
        const req = zmq.socket("req")

        frontend.bind(frontendAddr, err => {
          if (err) throw err
          backend.bind(backendAddr, err => {
            if (err) throw err

            req.connect(frontendAddr)
            rep.connect(backendAddr)
            sockets.push(frontend, backend, req, rep)

            req.on("message", function(msg) {
              assert.instanceOf(msg, Buffer)
              assert.equal(msg.toString(), "foo bar")
              done()
            })

            rep.on("message", function(msg) {
              rep.send(msg + " bar")
            })

            setTimeout(() => req.send("foo"), 15)
            zmq.proxy(frontend, backend)
          })
        })
      })

      it("should proxy rep-req connections with capture", function(done) {
        const frontendAddr = uniqAddress(proto)
        const backendAddr = uniqAddress(proto)
        const captureAddr = uniqAddress(proto)

        const frontend = zmq.socket("router")
        const backend = zmq.socket("dealer")

        const rep = zmq.socket("rep")
        const req = zmq.socket("req")

        const capture = zmq.socket("pub")
        const capSub = zmq.socket("sub")

        frontend.bind(frontendAddr, err => {
          if (err) throw err
          backend.bind(backendAddr, err => {
            if (err) throw err
            capture.bind(captureAddr, err => {
              if (err) throw err

              req.connect(frontendAddr)
              rep.connect(backendAddr)
              capSub.connect(captureAddr)
              capSub.subscribe("")
              sockets.push(frontend, backend, req, rep, capture, capSub)

              let counter = 2

              req.on("message", function(msg) {
                if (--counter == 0) done()
              })

              rep.on("message", function(msg) {
                rep.send(msg + " bar")
              })

              capSub.on("message", function(msg) {
                assert.instanceOf(msg, Buffer)
                assert.equal(msg.toString(), "foo bar")

                if (--counter == 0) done()
              })

              setTimeout(() => req.send("foo"), 15)
              zmq.proxy(frontend, backend, capture)
            })
          })
        })
      })
    })
  }
}
