/* Copyright (c) 2017-2018 Rolf Timmermans */
#pragma once

#include "binding.h"
#include "util/trash.h"

#include <forward_list>

namespace zmq {
class OutgoingMsg {
public:
    class Parts;

    static void Initialize(Napi::Env env);

    /* Avoid copying outgoing messages, since the destructor is not copy safe,
       nor should we have to copy messages with the right STL containers. */
    OutgoingMsg(const OutgoingMsg&) = delete;
    OutgoingMsg& operator=(const OutgoingMsg&) = delete;

    /* Outgoing message. Takes a string or buffer argument and releases
       the underlying V8 resources whenever the message is sent, or earlier
       if the message was copied (small buffers & strings). */
    explicit OutgoingMsg(Napi::Value value);
    ~OutgoingMsg();

    inline operator zmq_msg_t*() {
        return &msg;
    }

private:
    class Reference {
        Napi::Reference<Napi::Value> persistent;

    public:
        inline explicit Reference(Napi::Value val) : persistent(Napi::Persistent(val)) {}
    };

    static Trash<Reference> trash;

    zmq_msg_t msg;
};

/* Simple list over outgoing messages. Will take a single v8 value or an array
   of values and keep references to these items as necessary. */
class OutgoingMsg::Parts {
    std::forward_list<OutgoingMsg> parts;

public:
    inline Parts() {}
    explicit Parts(Napi::Value value);

    inline std::forward_list<OutgoingMsg>::iterator begin() {
        return parts.begin();
    }

    inline std::forward_list<OutgoingMsg>::iterator end() {
        return parts.end();
    }

    inline void Clear() {
        parts.clear();
    }
};
}
