const zmq = require("../../../draft")
const semver = require("semver")
const {assert} = require("chai")
const {testProtos, uniqAddress} = require("../helpers")

for (const proto of testProtos("tcp", "ipc", "inproc")) {
  describe.only(`socket with ${proto} draft client/server`, function() {
    beforeEach(function() {
      this.server = new zmq.Server
      this.clientA = new zmq.Client
      this.clientB = new zmq.Client
    })

    afterEach(function() {
      this.server.close()
      this.clientA.close()
      this.clientB.close()
      gc()
    })

    // describe("send", function() {
    //   it("should deliver messages", async function() {
    //     const address = uniqAddress(proto)
    //     const messages = ["foo", "bar", "baz", "qux"]
    //     const receivedA = []
    //     const receivedB = []
    //
    //     await this.router.bind(address)
    //     this.dealerA.connect(address)
    //     this.dealerB.connect(address)
    //
    //     const echo = async () => {
    //       for await (const [sender, msg] of this.router) {
    //         await this.router.send([sender, msg])
    //       }
    //     }
    //
    //     const send = async () => {
    //       for (const msg of messages) {
    //         await this.dealerA.send(msg)
    //         await this.dealerB.send(msg)
    //       }
    //
    //       for await (const msg of this.dealerA) {
    //         receivedA.push(msg.toString())
    //         if (receivedA.length == messages.length) break
    //       }
    //
    //       for await (const msg of this.dealerB) {
    //         receivedB.push(msg.toString())
    //         if (receivedB.length == messages.length) break
    //       }
    //
    //       this.router.close()
    //     }
    //
    //     await Promise.all([echo(), send()])
    //     assert.deepEqual(receivedA, messages)
    //     assert.deepEqual(receivedB, messages)
    //   })
    //
    //   /* This only works reliably with ZMQ 4.2.3+ */
    //   if (semver.satisfies(zmq.version, ">= 4.2.3")) {
    //     it("should fail unroutable message if mandatory", async function() {
    //       this.router.mandatory = true
    //       this.router.sendTimeout = 0
    //       try {
    //         await this.router.send(["fooId", "foo"])
    //         assert.ok(false)
    //       } catch (err) {
    //         assert.instanceOf(err, Error)
    //
    //         assert.equal(err.message, "Host unreachable")
    //         assert.equal(err.code, "EHOSTUNREACH")
    //         assert.typeOf(err.errno, "number")
    //       }
    //     })
    //   }
    // })
  })
}
