'use strict';
    const cloudbase = require('@cloudbase/node-sdk');
    const app = cloudbase.init({
      env: cloudbase.SYMBOL_CURRENT_ENV
    });
    const auth = app.auth();

    exports.main = async (event, context) => {
      try {
        const token = await auth.getAccessToken();
        return {
          accessToken: token
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    };
  
