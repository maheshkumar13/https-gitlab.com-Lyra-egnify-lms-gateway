import CryptoJS from 'crypto-js';
import { config } from '../config/environment';

export const encriptObject = (item) => { // Encrypt any JSON data
    for (const key in item) {
      if (item[key] !== null || item[key] !== undefined) {
        if (Array.isArray(item[key]) && key === 'paragraph') {
          for (const arrayItems in item[key]) {
            item[key][arrayItems] = CryptoJS.AES.encrypt(JSON.stringify(item[key][arrayItems]), config.encript.key).toString();
          }
        } else if (typeof item[key] === 'object') { // Encript recursively for nested JSON and array
          encriptObject(item[key]);
        } else {
        // AES dataencription with Crypto-js library
          if (key !== 'question' && key !== 'option' && key !== 'optionText' && key !== 'label' && key !== 'text' && key !== 'paragraph') { continue; }
          item[key] = CryptoJS.AES.encrypt(JSON.stringify(item[key]), config.encript.key).toString();
        /* Decription
        var bytes  = CryptoJS.AES.decrypt(item[key].toString(), config.encript.key);
        var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        console.log(key+" "+decryptedData);
        item[key] = decryptedData;
        */
        }
      }
    }
    return item;
  };

  export default {
    encriptObject
  }