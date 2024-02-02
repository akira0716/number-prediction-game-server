module.exports.eventList = {
  //#region 接続関係
  CONNECTION: {
    EventName: "connection",
    Params: {},
  },
  DISCONNECT: {
    EventName: "disconnect",
    Params: {},
  },
  //#endregion

  //#region 送信用
  ROOM_ID: {
    EventName: "ROOM_ID",
    Params: {
      room_id: "",
    },
  },
  START: {
    EventName: "START",
    Params: {
      room_id: "",
    },
  },
  READY: {
    EventName: "READY",
    Params: {},
  },
  RESULT: {
    EventName: "RESULT",
    Params: {
      predict_num: "",
      EAT: 0,
      BITE: 0,
      status: "",
    },
  },
  END: {
    EventName: "END",
    Params: { predict_num: "", EAT: 0, BITE: 0, status: "" },
  },
  ERROR: {
    EventName: "ERROR",
    Params: {
      err_msg: "",
    },
  },
  FORCE_END: {
    EventName: "FORCE_END",
    Params: {},
  },
  //#endregion

  //#region 受信用
  SET_NUM: {
    EventName: "SET_NUM",
    Params: {
      room_id: "",
      number: "",
    },
  },
  PREDICT: {
    EventName: "PREDICT",
    Params: {
      room_id: "",
      number: "",
    },
  },
  INVITE: {
    EventName: "INVITE",
    Params: {},
  },
  JOIN: {
    EventName: "JOIN",
    Params: {
      room_id: "",
    },
  },
  CANCEL: {
    EventName: "CANCEL",
    Params: {},
  },
  //#endregion
};
