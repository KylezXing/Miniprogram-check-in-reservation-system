const getOpenId = require('./getOpenId/index');
const getMiniProgramCode = require('./getMiniProgramCode/index');
const createCollection = require('./createCollection/index');
const selectRecord = require('./selectRecord/index');
const updateRecord = require('./updateRecord/index');
const sumRecord = require('./sumRecord/index');
const fetchGoodsList = require('./fetchGoodsList/index');
const genMpQrcode = require('./genMpQrcode/index');
const deleteRecord = require('./deleteRecord/index');
const selectOpenId = require('./selectOpenId/index');
const getAccessToken = require('./getAccessToken/index');
const updateUserInfo = require('./updateUserInfo/index');

// 云函数入口函数
exports.main = async (event, context) => {
    switch (event.type) {
        case 'getOpenId':
            return await getOpenId.main(event, context);
        case 'getMiniProgramCode':
            return await getMiniProgramCode.main(event, context);
        case 'createCollection':
            return await createCollection.main(event, context);
        case 'selectRecord':
            return await selectRecord.main(event, context);
        case 'updateRecord':
            return await updateRecord.main(event, context);
        case 'sumRecord':
            return await sumRecord.main(event, context);
        case 'fetchGoodsList':
            return await fetchGoodsList.main(event, context);
        case 'genMpQrcode':
            return await genMpQrcode.main(event, context);
        case 'deleteRecord':
            return await deleteRecord.main(event, context);
        case 'selectOpenId':
            return await selectOpenId.main(event, context);
        case 'getAccessToken':
            return await getAccessToken.main(event, context);
        case 'updateUserInfo':
            return await updateUserInfo.main(event, context);
            
    }
};

