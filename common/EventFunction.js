const { DataArea } = require("../common/DataArea");
const { ErrorMsgDefine } = require("../common/ErrorMsgDefine");
const { io } = require("../server");
const { eventList } = require("./eventList");

module.exports.EventFunction = {
  // #region イベント[ INVITE ]受信時処理
  /**
   * イベント[ INVITE ]受信時処理
   * @param {*} msg
   * @returns
   */
  // evntCreateRoom: (msg) => {
  //   // メッセージからデータ取得
  //   const data = parseMsgParams(msg);

  //   const newRoom = { ...room, ["room_id"]: data.room_id };
  //   DataArea.push(newRoom);
  // },
  //#endregion

  //#region イベント[ JOIN ]受信時処理
  /**
   * イベント[ JOIN ]受信時処理
   * @param {*} msg
   * @returns
   */
  evntJoinRoom: (client_id, msg) => {
    // メッセージからデータ取得
    const data = parseMsgParams(msg);

    // ルーム参加チェック
    if (checkJoinRoom(data.room_id) === false) {
      // ERROR[ ERROR_ROOM_MAX ]送信
      sendErrorMsg(client_id, ErrorMsgDefine.ERROR_ROOM_MAX);
      return;
    }

    DataArea.forEach((room) => {
      if (room.room_id === data.room_id) {
        room.status = false;
        room.player_2.id = client_id;

        eventList.START.Params.room_id = room.room_id;
        io.to(client_id).emit(
          eventList.START.EventName,
          JSON.stringify(eventList.START.Params)
        );
        io.to(room.player_1.id).emit(
          eventList.START.EventName,
          JSON.stringify(eventList.START.Params)
        );
      }
    });

    console.log(DataArea);
  },
  //#endregion

  //#region イベント[ SET_NUM ]受信時処理
  /**
   * イベント[ SET_NUM ]受信時処理
   * @param {*} number
   */
  evntSetNumber: (client_id, msg) => {
    // メッセージからデータ取得
    const data = parseMsgParams(msg);

    if (checkNumber(data) === false) {
      // ERROR[ ERROR_SAME_NUM ]送信
      sendErrorMsg(client_id, ErrorMsgDefine.ERROR_SAME_NUM);
      return;
    }

    updateNumber(client_id, data);

    // イベント[READY]送信
    DataArea.forEach((room) => {
      if (room.room_id === data.room_id) {
        if (room.count === 2) {
          io.to(room.player_1.id).emit(eventList.READY.EventName);
          io.to(room.player_2.id).emit(eventList.READY.EventName);
          room.count = 0;
        }
      }
    });
  },
  //#endregion

  //#region イベント[ PREDICT ]受信時処理
  /**
   * イベント[ PREDICT ]受信時処理
   * @param {*} number
   */
  evntPredict: (client_id, msg) => {
    // メッセージからデータ取得
    const data = parseMsgParams(msg);

    if (checkNumber(data) === false) {
      // ERROR[ ERROR_SAME_NUM ]送信
      sendErrorMsg(client_id, ErrorMsgDefine.ERROR_SAME_NUM);
      return;
    }

    getResultForPrediction(client_id, data);

    const room = DataArea.find((room) => room.room_id === data.room_id);
    if (room) {
      if (room.count === 2) {
        let endFlg = false;
        // プレイヤー1の勝利
        if (room.end === 1) {
          room.player_1.result.status = "あなたの勝ちです。";
          room.player_2.result.status = "あなたの負けです。";
          endFlg = true;
        }
        // プレイヤー2の処理
        else if (room.end === 2) {
          room.player_1.result.status = "あなたの負けです。";
          room.player_2.result.status = "あなたの勝ちです。";
          endFlg = true;
        }
        // 引き分け
        else if (room.end === 3) {
          room.player_1.result.status = "引き分けです。";
          room.player_2.result.status = "引き分けです。";
          endFlg = true;
        }

        if (endFlg) {
          // イベント[END]送信
          eventList.END.Params = room.player_1.result;
          io.to(room.player_1.id).emit(
            eventList.END.EventName,
            JSON.stringify(eventList.END.Params)
          );
          eventList.END.Params = room.player_2.result;
          io.to(room.player_2.id).emit(
            eventList.END.EventName,
            JSON.stringify(eventList.END.Params)
          );

          DataArea.pop(room);
          console.log(DataArea);

          return;
        }

        // イベント[RESULT]送信
        eventList.RESULT.Params = room.player_1.result;
        io.to(room.player_1.id).emit(
          eventList.RESULT.EventName,
          JSON.stringify(eventList.RESULT.Params)
        );
        eventList.RESULT.Params = room.player_2.result;
        io.to(room.player_2.id).emit(
          eventList.RESULT.EventName,
          JSON.stringify(eventList.RESULT.Params)
        );

        room.count = 0;
      }
    }
  },
  //#endregion
};

//#region その他
//#region 予想結果
const getResultForPrediction = (client_id, data) => {
  const { room_id, number } = data;
  let EAT = 0;
  let BITE = 0;

  const room = DataArea.find((room) => room.room_id === room_id);
  const predictNum = number.split("");
  const enemyNum =
    client_id === room.player_1.id
      ? room.player_2.number.split("")
      : room.player_1.number.split("");

  // 桁と数字の一致
  for (let digit = 0; digit < 3; digit++) {
    if (predictNum[digit] === enemyNum[digit]) {
      EAT++;
    }
  }

  // 数字のみの一致
  for (let eDigit = 0; eDigit < 3; eDigit++) {
    for (let pDigit = 0; pDigit < 3; pDigit++) {
      if (eDigit === pDigit) {
        continue;
      }
      if (predictNum[pDigit] === enemyNum[eDigit]) {
        BITE++;
        break;
      }
    }
  }

  const player = client_id === room.player_1.id ? room.player_1 : room.player_2;
  player.result.predict_num = number;
  player.result.EAT = EAT;
  player.result.BITE = BITE;

  if (EAT === 3) {
    if (room.end === 0) {
      if (player === room.player_1) {
        room.end = 1; // プレイヤー1の勝利
      } else {
        room.end = 2; // プレイヤー2の勝利
      }
    } else {
      room.end = 3; // 引き分け
    }
  }

  room.count++;
};
//#endregion

//#region roomIDチェック処理
const checkRoomID = (room_id) => {
  const room = DataArea.find((room) => room.room_id === room_id);

  if (room) {
    return false;
  }
  return true;
};
//#endregion

//#region ルーム参加チェック
const checkJoinRoom = (room_id) => {
  const room = DataArea.find((room) => room.room_id === room_id);
  if (room) {
    if (room.status) {
      return true;
    }
  }

  return false;
};
//#endregion

//#region メッセージパラメータ取得
const parseMsgParams = (msg) => {
  const data = JSON.parse(msg);

  return data;
};
//#endregion

//#region 数字設定
const updateNumber = (client_id, data) => {
  const { room_id, number } = data;

  DataArea.forEach((room) => {
    if (room.room_id === room_id) {
      if (room.player_1.id === client_id) {
        room.player_1.number = number;
        room.count++;
      } else {
        room.player_2.number = number;
        room.count++;
      }
    }
  });

  console.log(DataArea);
};
//#endregion

//#region 数字チェック
const checkNumber = (data) => {
  const { number } = data;

  const checkNum = number.split("");

  // 1桁目と2桁目のチェック
  if (checkNum[0] === checkNum[1]) {
    return false;
  }

  // 1桁目と3桁目のチェック
  if (checkNum[0] === checkNum[2]) {
    return false;
  }

  // 2桁目と3桁目のチェック
  if (checkNum[1] === checkNum[2]) {
    return false;
  }

  return true;
};
//#endregion

//#region エラーメッセージ送信
const sendErrorMsg = (client_id, errMsg) => {
  eventList.ERROR.Params = {
    err_msg: errMsg,
  };
  io.to(client_id).emit(
    eventList.ERROR.EventName,
    JSON.stringify(eventList.ERROR.Params)
  );
};
//#endregion
//#endregion
