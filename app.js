const { io } = require("./server");
const { EventFunction } = require("./common/EventFunction");
const { eventList } = require("./common/eventList");
const { DataArea, roomCount } = require("./common/DataArea");

// 通信確立(connection)
io.on(eventList.CONNECTION.EventName, (socket) => {
  console.log("connect successful");

  //#region 通信切断時(disconnect)
  socket.on(eventList.DISCONNECT.EventName, () => {
    console.log("disconnected");

    DataArea.forEach((room) => {
      if (room.player_1.id === socket.id || room.player_2.id === socket.id) {
        const sendPlayer =
          room.player_1.id === socket.id ? room.player_2.id : room.player_1.id;

        io.to(sendPlayer).emit("FORCE_END");

        DataArea.pop(room);
      }
    });
  });
  //#endregion

  //#region イベント[INVITE]受信
  socket.on(eventList.INVITE.EventName, () => {
    const room_id = String(roomCount.count).padStart(5, "0");
    const existRoom = DataArea.find((room) => room.id === room_id);
    if (existRoom) {
      // エラー
      return;
    }
    const newRoom = {
      room_id: room_id,
      player_1: {
        id: socket.id,
        number: "",
        result: {
          predict_num: "",
          EAT: 0,
          BITE: 0,
          status: 0,
        },
      },
      player_2: {
        id: "",
        number: "",
        result: {
          predict_num: "",
          EAT: 0,
          BITE: 0,
          status: "",
        },
      },
      status: true,
      count: 0,
      end: 0,
    };
    DataArea.push(newRoom);
    const data = { room_id: room_id };
    io.to(socket.id).emit("ROOM_ID", JSON.stringify(data));

    roomCount.count++;

    console.log(DataArea);
  });
  //#endregion

  //#region イベント[JOIN]受信
  socket.on(eventList.JOIN.EventName, (msg) => {
    EventFunction.evntJoinRoom(socket.id, msg);
  });
  //#endregion

  //#region イベント[SET_NUM]受信
  socket.on(eventList.SET_NUM.EventName, (msg) => {
    EventFunction.evntSetNumber(socket.id, msg);
  });
  //#endregion

  //#region イベント[PREDICT]受信
  socket.on(eventList.PREDICT.EventName, (msg) => {
    EventFunction.evntPredict(socket.id, msg);
  });
  //#endregion

  //#region イベント[CANCEL]受信
  socket.on(eventList.CANCEL.EventName, () => {
    DataArea.forEach((room) => {
      if (room.player_1.id === socket.id) {
        DataArea.pop(room);
      }
    });
  });
  //#endregion
});
